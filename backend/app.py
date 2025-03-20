import os
import sys
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import argparse
import time

# Add the SAM directory to the path
sys.path.append('.')

# Import necessary modules
from models.psp import pSp
from scripts.align_all_parallel import align_face
from utils.common import tensor2im

app = Flask(__name__)
CORS(app)

# Global variables for model
model = None
transform = None
device = None

def init_model():
    global model, transform, device
    
    # Initialize device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Define the model arguments
    model_path = 'pretrained_models/sam_ffhq_aging.pt'
    
    # Load the model
    ckpt = torch.load(model_path, map_location='cpu')
    opts = ckpt['opts']
    
    # Convert namespace to structure that can be used by the model
    opts = argparse.Namespace(**opts)
    
    # Set test options
    opts.device = device
    opts.checkpoint_path = model_path
    
    # Initialize model
    model = pSp(opts)
    model.eval()
    model.to(device)
    
    # Initialize transform
    transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    ])
    
    print("Model initialized successfully")

@app.before_first_request
def initialize():
    init_model()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/transform_age', methods=['POST'])
def transform_age():
    try:
        # Get data from request
        data = request.json
        image_b64 = data['image']
        target_age = int(data['targetAge'])
        
        # Convert base64 to image
        image_data = base64.b64decode(image_b64.split(',')[1])
        input_image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Align face
        try:
            aligned_image = align_face(input_image)
        except Exception as e:
            print(f"Error in face alignment: {str(e)}")
            aligned_image = input_image.resize((256, 256))  # Fallback if alignment fails
        
        # Transform to tensor
        input_tensor = transform(aligned_image).unsqueeze(0).to(device)
        
        # Age condition (normalize to range 0-1)
        age_tensor = torch.tensor([target_age / 100.0], device=device)
        
        # Generate result
        with torch.no_grad():
            result_tensor = model(input_tensor, age_tensor, randomize_noise=False, resize=False)[0]
            
        # Convert to image
        result_image = tensor2im(result_tensor)
        result_image = Image.fromarray(result_image)
        
        # Convert to base64
        buffered = io.BytesIO()
        result_image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return jsonify({
            'success': True,
            'transformed_image': f'data:image/jpeg;base64,{img_str}'
        })
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)