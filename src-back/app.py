import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from werkzeug.utils import secure_filename
import tensorflow as tf
import numpy as np
import cv2

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
CORS(app)  # This will enable CORS for all routes
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load the model
def load_model(model_name):
    model_path = os.path.join('models', model_name + '.keras')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file {model_path} not found.")
    return tf.keras.models.load_model(model_path)

# Predict function
def predict_image(model, image_path, image_type1, image_type2):
    img = cv2.imread(image_path)
    if img is None:
        return "Image not found!"
    resize = tf.image.resize(img, (256, 256))
    yhat = model.predict(np.expand_dims(resize / 255, 0))

    prediction = image_type1 if yhat > 0.5 else image_type2
    return prediction

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        model_name = request.form.get('modelName')
        if not model_name:
            return jsonify({'error': 'No model name provided'}), 400
        
        model = load_model(model_name)
        if not model:
            return jsonify({'error': f'Model {model_name} not found'}), 400
        
        image_type1, image_type2 = get_image_types(model_name)
        if not image_type1 or not image_type2:
            return jsonify({'error': f'Image types not found for model {model_name}'}), 400
        
        prediction = predict_image(model, filepath, image_type1, image_type2)
        return jsonify({'prediction': prediction})

@app.route('/models', methods=['GET'])
def list_models():
    models_dir = 'models'  # Directory where models are stored
    models = [f[:-6] for f in os.listdir(models_dir) if f.endswith('.keras')]
    return jsonify({'models': models})

# Route to get image types
@app.route('/get_image_types', methods=['POST'])
def get_image_types_route():
    model_name = request.form['model_name']
    try:
        image_type1, image_type2 = get_image_types(model_name)
        return jsonify({'image_type1': image_type1, 'image_type2': image_type2})
    except Exception as e:
        return jsonify({'error': str(e)})

def get_image_types(model_name):
    label_file_path = os.path.join('models', model_name + '.txt')
    if not os.path.exists(label_file_path):
        raise FileNotFoundError(f"Label file {label_file_path} not found.")
    
    with open(label_file_path, 'r') as file:
        image_types = file.read().strip().split(',')
        if len(image_types) != 2:
            raise ValueError("The label file must contain exactly two labels.")
    return image_types[0], image_types[1]

if __name__ == "__main__":
    app.run(debug=True)
