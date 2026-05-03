import numpy as np
import pandas as pd

SYMPTOM_MAPPING = {
    'fever': ['fever', 'high fever', 'mild fever', 'temperature', 'pyrexia'],
    'chills': ['chills', 'shivering', 'cold'],
    
    'cough': ['cough', 'dry cough', 'wet cough', 'persistent cough', 'coughing'],
    'shortness of breath': ['shortness of breath', 'breathlessness', 'difficulty breathing', 'dyspnea', 'breath'],
    'chest pain': ['chest pain', 'chest discomfort', 'chest tightness'],
    'wheezing': ['wheezing', 'wheeze'],
    'runny nose': ['runny nose', 'nasal discharge', 'runny'],
    'sore throat': ['sore throat', 'throat pain', 'throat'],
    'sneezing': ['sneezing', 'sneeze'],
    'nasal congestion': ['nasal congestion', 'blocked nose', 'stuffy nose', 'congestion'],
    
    'headache': ['headache', 'head pain', 'severe headache', 'migraine'],
    'body aches': ['body aches', 'muscle pain', 'body pain', 'myalgia', 'aches'],
    'joint pain': ['joint pain', 'arthralgia'],
    'back pain': ['back pain', 'backache'],
    'stomach pain': ['stomach pain', 'abdominal pain', 'tummy pain', 'stomach ache'],
    
    'nausea': ['nausea', 'feeling sick', 'queasiness'],
    'vomiting': ['vomiting', 'throwing up', 'emesis'],
    'diarrhea': ['diarrhea', 'loose stools', 'watery stools'],
    'constipation': ['constipation', 'hard stools'],
    'bloating': ['bloating', 'abdominal distension', 'bloat'],
    'loss of appetite': ['loss of appetite', 'no appetite', 'appetite'],
    
    'dizziness': ['dizziness', 'vertigo', 'lightheaded', 'dizzy'],
    'fatigue': ['fatigue', 'tiredness', 'weakness', 'exhaustion', 'tired'],
    'confusion': ['confusion', 'disorientation'],
    
    'loss of taste': ['loss of taste', 'ageusia', 'taste'],
    'loss of smell': ['loss of smell', 'anosmia', 'smell'],
    'blurred vision': ['blurred vision', 'vision problems', 'vision', 'visual'],
    'sensitivity to light': ['sensitivity to light', 'photophobia', 'light sensitivity', 'light'],
    
    'increased thirst': ['increased thirst', 'excessive thirst', 'thirst'],
    'frequent urination': ['frequent urination', 'polyuria', 'urination'],
    'extreme hunger': ['extreme hunger', 'excessive hunger', 'hunger'],
    'weight loss': ['weight loss', 'losing weight'],
    'weight gain': ['weight gain', 'gaining weight'],
    
    'rash': ['rash', 'skin rash'],
    'itching': ['itching', 'itchy skin', 'pruritus', 'itchy'],
    'sweating': ['sweating', 'excessive sweating', 'perspiration'],
    
    'anxiety': ['anxiety', 'nervousness', 'worry', 'anxious'],
    'depression': ['depression', 'sadness', 'low mood', 'sad'],
    'insomnia': ['insomnia', 'sleeplessness', 'cannot sleep', 'sleep'],
    'palpitations': ['palpitations', 'racing heart', 'irregular heartbeat'],
    'swelling': ['swelling', 'edema', 'puffiness'],
}

def normalize_symptom(symptom):
    """
    Normalize user input symptom to standard symptom name
    """
    symptom_lower = symptom.lower().strip()
    
    for standard_symptom, variations in SYMPTOM_MAPPING.items():
        for variation in variations:
            if variation in symptom_lower or symptom_lower in variation:
                return standard_symptom
    
    return symptom_lower.replace(' ', '_')

def prepare_symptom_vector(user_symptoms, all_symptoms):
    """
    Convert user symptoms to binary vector matching model's expected input
    
    Args:
        user_symptoms: List of symptom strings from user
        all_symptoms: List of all possible symptoms (from training)
    
    Returns:
        numpy array of binary features
    """
    normalized_symptoms = [normalize_symptom(s) for s in user_symptoms]
    
    symptom_vector = np.zeros(len(all_symptoms))
    
    for i, symptom in enumerate(all_symptoms):
        if symptom.replace('_', ' ') in normalized_symptoms:
            symptom_vector[i] = 1
        else:
            for user_sym in normalized_symptoms:
                if user_sym in symptom or symptom in user_sym:
                    symptom_vector[i] = 1
                    break
    
    return symptom_vector

def calculate_confidence(probabilities):
    """
    Calculate confidence score from model probabilities
    """
    max_prob = np.max(probabilities)
    return min(int(max_prob * 100), 95)  # Cap at 95% to match original system