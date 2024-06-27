import tensorflow as tf
import numpy as np
import cv2

def load_model(model_path='trained_model.h5'):
    return tf.keras.models.load_model(model_path)

def predict_image(model, image_path, image_type1, image_type2):
    img = cv2.imread(image_path)
    if img is None:
        print("Image not found!")
        return
    resize = tf.image.resize(img, (256, 256))
    yhat = model.predict(np.expand_dims(resize / 255, 0))

    prediction = image_type1 if yhat < 0.5 else image_type2
    print(f'Prediction is {prediction}')

    # Save the prediction result
    with open('prediction_result.txt', 'w') as f:
        f.write(f'Prediction for {image_path}: {prediction}\n')

if __name__ == "__main__":
    image_type1 = input("Enter the first type of images: ")
    image_type2 = input("Enter the second type of images: ")

    model = load_model()

    image_path = input("Please enter filepath of image to test on: ")
    predict_image(model, image_path, image_type1, image_type2)
