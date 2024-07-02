import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tensorflow as tf
import numpy as np
import cv2
from train import train_model

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
CORS(app)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load the model
def load_model(model_name):
    model_path = os.path.join('models', model_name + '.keras')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file {model_path} not found.")
    return tf.keras.models.load_model(model_path)


def predict_image(model, image_path, image_type1, image_type2):
    img = cv2.imread(image_path)
    if img is None:
        return "Image not found!"
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = tf.image.resize(img, (256, 256))
    img = img / 255.0  # Normalize
    yhat = model.predict(np.expand_dims(img, 0))
    print(yhat)
    prediction = image_type1 if yhat < 0.5 else image_type2
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
        
        image_type1, image_type2 = get_model_names(model_name)
        if not image_type1 or not image_type2:
            return jsonify({'error': f'Image types not found for model {model_name}'}), 400
        
        prediction = predict_image(model, filepath, image_type1, image_type2)
        return jsonify({'prediction': prediction})

@app.route('/models', methods=['GET'])
def list_models():
    models_dir = 'models'
    models = [f[:-6] for f in os.listdir(models_dir) if f.endswith('.keras')]
    return jsonify({'models': models})

def get_model_names(model_name):
    label_file_path = os.path.join('models', model_name + '.txt')
    if not os.path.exists(label_file_path):
        raise FileNotFoundError(f"Label file {label_file_path} not found.")
    
    with open(label_file_path, 'r') as file:
        image_types = file.read().strip().split(',')
        if len(image_types) != 2:
            raise ValueError("The label file must contain exactly two labels.")
    return image_types[0], image_types[1]

@app.route('/train', methods=['POST'])
def train():
    model_name = request.form.get('modelName')
    folder1_name = request.form.get('folder1Name')
    folder2_name = request.form.get('folder2Name')

    if not model_name or not folder1_name or not folder2_name:
        return jsonify({'error': 'Model name and folder names must be provided'}), 400

    folder1_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(folder1_name))
    folder2_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(folder2_name))

    os.makedirs(folder1_path, exist_ok=True)
    os.makedirs(folder2_path, exist_ok=True)

    file_keys1 = [key for key in request.files if key.startswith('file1_')]
    file_keys2 = [key for key in request.files if key.startswith('file2_')]

    for key in file_keys1:
        file = request.files[key]
        file.save(os.path.join(folder1_path, secure_filename(file.filename)))

    for key in file_keys2:
        file = request.files[key]
        file.save(os.path.join(folder2_path, secure_filename(file.filename)))

    try:
        print("ok")
        train_model(folder1_path.lstrip(8), folder2_path.lstrip(8), model_name)
        return jsonify({'success': f'Model {model_name} trained successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to train model: {str(e)}'}), 500

if __name__ == "__main__":
    app.run(debug=True)
