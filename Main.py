import tensorflow as tf
import imghdr
from matplotlib import pyplot as plt
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dense, Flatten, Dropout


from ImageClean import imageClean;

def classify():
    image_type1 = input("Enter the first type of images: ")
    image_type2 = input("Enter the second type of images: ")

    print("Thank you for this")
    print("Processing...")
    
    imageClean()
    
    data = tf.keras
    
    
    
