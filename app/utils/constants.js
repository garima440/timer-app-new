// utils/constants.js

export const weekSchedule = {
    elementary: {
      monday: [
        { time: '8:30 AM', subject: 'Morning Meeting', location: 'Classroom' },
        { time: '9:00 AM', subject: 'Math', location: 'Classroom' },
        { time: '10:15 AM', subject: 'Reading', location: 'Classroom' },
        { time: '11:30 AM', subject: 'Lunch', location: 'Cafeteria' },
        { time: '12:15 PM', subject: 'Science', location: 'Classroom' },
        { time: '1:30 PM', subject: 'Special (Art)', location: 'Art Room' },
        { time: '2:45 PM', subject: 'Pack up', location: 'Classroom' },
        { time: '3:00 PM', subject: 'Dismissal', location: 'Main Entrance' },
      ],
      tuesday: [
        { time: '8:30 AM', subject: 'Morning Meeting', location: 'Classroom' },
        { time: '9:00 AM', subject: 'Reading', location: 'Classroom' },
        { time: '10:15 AM', subject: 'Math', location: 'Classroom' },
        { time: '11:30 AM', subject: 'Lunch', location: 'Cafeteria' },
        { time: '12:15 PM', subject: 'Social Studies', location: 'Classroom' },
        { time: '1:30 PM', subject: 'Special (Music)', location: 'Music Room' },
        { time: '2:45 PM', subject: 'Pack up', location: 'Classroom' },
        { time: '3:00 PM', subject: 'Dismissal', location: 'Main Entrance' },
      ],
      wednesday: [
        { time: '8:30 AM', subject: 'Morning Meeting', location: 'Classroom' },
        { time: '9:00 AM', subject: 'Math', location: 'Classroom' },
        { time: '10:15 AM', subject: 'Reading', location: 'Classroom' },
        { time: '11:30 AM', subject: 'Lunch', location: 'Cafeteria' },
        { time: '12:15 PM', subject: 'Science', location: 'Lab' },
        { time: '1:30 PM', subject: 'Special (PE)', location: 'Gym' },
        { time: '2:45 PM', subject: 'Pack up', location: 'Classroom' },
        { time: '3:00 PM', subject: 'Dismissal', location: 'Main Entrance' },
      ],
      thursday: [
        { time: '8:30 AM', subject: 'Morning Meeting', location: 'Classroom' },
        { time: '9:00 AM', subject: 'Reading', location: 'Library' },
        { time: '10:15 AM', subject: 'Math', location: 'Classroom' },
        { time: '11:30 AM', subject: 'Lunch', location: 'Cafeteria' },
        { time: '12:15 PM', subject: 'Social Studies', location: 'Classroom' },
        { time: '1:30 PM', subject: 'Special (Art)', location: 'Art Room' },
        { time: '2:45 PM', subject: 'Pack up', location: 'Classroom' },
        { time: '3:00 PM', subject: 'Dismissal', location: 'Main Entrance' },
      ],
      friday: [
        { time: '8:30 AM', subject: 'Morning Meeting', location: 'Classroom' },
        { time: '9:00 AM', subject: 'Math', location: 'Classroom' },
        { time: '10:15 AM', subject: 'Reading', location: 'Classroom' },
        { time: '11:30 AM', subject: 'Lunch', location: 'Cafeteria' },
        { time: '12:15 PM', subject: 'Science', location: 'Classroom' },
        { time: '1:30 PM', subject: 'Special (Library)', location: 'Library' },
        { time: '2:45 PM', subject: 'Pack up', location: 'Classroom' },
        { time: '3:00 PM', subject: 'Dismissal', location: 'Main Entrance' },
      ],
    },
    high: {
      monday: [
        { time: '8:00 AM', subject: 'AP Chemistry', location: 'Room 201' },
        { time: '9:30 AM', subject: 'English Literature', location: 'Room 105' },
        { time: '11:00 AM', subject: 'Lunch', location: 'Cafeteria' },
        { time: '11:45 AM', subject: 'US History', location: 'Room 304' },
        { time: '1:15 PM', subject: 'Calculus', location: 'Room 208' },
        { time: '2:45 PM', subject: 'Study Hall', location: 'Library' },
      ],
      // Add other days similarly
    },
    college: {
      monday: [
        { time: '9:00 AM', subject: 'Computer Science 101', location: 'Hall A' },
        { time: '11:00 AM', subject: 'Physics Lab', location: 'Science Building' },
        { time: '2:00 PM', subject: 'Advanced Mathematics', location: 'Room 305' },
        { time: '4:00 PM', subject: 'Study Group', location: 'Library' },
      ],
      // Add other days similarly
    },
  };
  
  export const semesterData = {
    high: {
      progress: 66,
      currentWeek: 12,
      totalWeeks: 18,
      importantDates: [
        { week: 9, event: 'Midterms', status: 'completed' },
        { week: 14, event: 'Spring Break', status: 'upcoming' },
        { week: 16, event: 'Final Projects Due', status: 'upcoming' },
        { week: 18, event: 'Finals Week', status: 'upcoming' },
      ],
      courses: [
        { name: 'AP Chemistry', grade: '88%', status: 'Lab Report due Week 13' },
        { name: 'English Literature', grade: '92%', status: 'Essay due Week 15' },
        { name: 'US History', grade: '90%', status: 'Project presentation Week 16' },
        { name: 'Calculus', grade: '87%', status: 'Midterm grade posted' },
      ],
    },
    college: {
      progress: 45,
      currentWeek: 8,
      totalWeeks: 16,
      importantDates: [
        { week: 7, event: 'Midterms', status: 'completed' },
        { week: 10, event: 'Research Paper Due', status: 'upcoming' },
        { week: 13, event: 'Project Presentations', status: 'upcoming' },
        { week: 16, event: 'Finals Week', status: 'upcoming' },
      ],
      courses: [
        { name: 'Computer Science 101', grade: '91%', status: 'Project phase 2 due' },
        { name: 'Physics 201', grade: '85%', status: 'Lab report pending' },
        { name: 'Advanced Mathematics', grade: '88%', status: 'Quiz next week' },
        { name: 'Technical Writing', grade: '94%', status: 'Research paper draft due' },
      ],
    },
  };
  
  export const educationalStages = [
    { 
      id: 'elementary',
      name: 'Elementary School',
      grades: '1-5',
      typical_age: '6-11',
      description: 'Foundation of learning',
    },
    { 
      id: 'middle',
      name: 'Middle School',
      grades: '6-8',
      typical_age: '11-14',
      description: 'Transition and growth',
    },
    { 
      id: 'high',
      name: 'High School',
      grades: '9-12',
      typical_age: '14-18',
      description: 'College preparation',
    },
    { 
      id: 'college',
      name: 'College',
      grades: 'Undergraduate',
      typical_age: '18-22',
      description: 'Higher education',
    },
  ];
  
  const constants = {
    weekSchedule,
    semesterData,
    educationalStages,
  };
  
  export default constants;