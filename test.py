import tensorflow as tf
import numpy as np
import cv2
import os

def load_model(model_name):
    model_path = os.path.join('models', model_name + '.keras')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file {model_path} not found.")
    return tf.keras.models.load_model(model_path)

def get_image_types(model_name):
    label_file_path = os.path.join('models', model_name + '.txt')
    if not os.path.exists(label_file_path):
        raise FileNotFoundError(f"Label file {label_file_path} not found.")
    
    with open(label_file_path, 'r') as file:
        image_types = file.read().strip().split(',')
        if len(image_types) != 2:
            raise ValueError("The label file must contain exactly two labels.")
    return image_types[0], image_types[1]

def predict_image(model, image_path, image_type1, image_type2):
    img = cv2.imread(image_path)
    if img is None:
        print("Image not found!")
        return
    resize = tf.image.resize(img, (256, 256))
    yhat = model.predict(np.expand_dims(resize / 255, 0))

    prediction = image_type1 if yhat > 0.5 else image_type2
    print(f'Prediction is {prediction}')

    # Save the prediction result
    with open('prediction_result.txt', 'a') as f:  # Append to file instead of overwriting
        f.write(f'Prediction for {image_path}: {prediction}\n')

if __name__ == "__main__":
    model_name = input("Enter the name of the model to load: ")
    model = load_model(model_name)

    image_type1, image_type2 = get_image_types(model_name)
    print(f"Model {model_name} will predict between: {image_type1} and {image_type2}")

    while True:
        image_path = input("Please enter the filepath of the image to test on (or type 'exit' to quit): ")
        if image_path.lower() == 'exit':
            break
        predict_image(model, image_path, image_type1, image_type2)
