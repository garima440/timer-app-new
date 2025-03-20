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
from argparse import Namespace
import dlib

# Add the SAM directory to the path
sys.path.append('.')

# Import necessary modules from SAM
from datasets.augmentations import AgeTransformer
from utils.common import tensor2im
from models.psp import pSp
from scripts.align_all_parallel import align_face

app = Flask(__name__)
CORS(app)

# Global variables for model
net = None
predictor = None
img_transforms = None

def init_model():
    global net, predictor, img_transforms
    
    # Define paths
    model_path = 'pretrained_models/sam_ffhq_aging.pt'
    
    # Load the model
    ckpt = torch.load(model_path, map_location='cpu')
    opts = ckpt['opts']
    
    # Update the training options
    opts['checkpoint_path'] = model_path
    opts = Namespace(**opts)
    
    # Initialize model
    net = pSp(opts)
    net.eval()
    
    # Check if CUDA is available
    if torch.cuda.is_available():
        net.cuda()
    
    # Load face predictor for alignment
    predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
    
    # Define image transforms
    img_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    ])
    
    print("Model and face predictor initialized successfully")

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
        
        # Save temporary file for alignment
        temp_image_path = 'temp_input.jpg'
        with open(temp_image_path, 'wb') as f:
            f.write(image_data)
        
        try:
            # Run alignment exactly as in the notebook
            aligned_image = align_face(filepath=temp_image_path, predictor=predictor)
            print(f"Aligned image has shape: {aligned_image.size}")
        except Exception as e:
            print(f"Error in face alignment: {str(e)}")
            # If alignment fails, use the original image
            aligned_image = Image.open(temp_image_path).convert("RGB")
            aligned_image = aligned_image.resize((256, 256))
        
        # Apply transforms
        input_image = img_transforms(aligned_image)
        
        # Create age transformer exactly as in the notebook
        age_transformer = AgeTransformer(target_age=target_age)
        
        # Run inference
        with torch.no_grad():
            # Apply age transformation to input image
            input_image_age = age_transformer(input_image.cpu())
            
            # Add batch dimension
            if torch.cuda.is_available():
                input_image_age = input_image_age.unsqueeze(0).cuda()
            else:
                input_image_age = input_image_age.unsqueeze(0)
                
            # Run through the network
            result_tensor = net(input_image_age, randomize_noise=False, resize=False)[0]
            
            # Convert to image
            result_image = tensor2im(result_tensor)
            result_image = Image.fromarray(result_image)
            
            # Clean up temporary file
            if os.path.exists(temp_image_path):
                os.remove(temp_image_path)
        
        # Convert result to base64
        buffered = io.BytesIO()
        result_image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
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