import tensorflow as tf
import numpy as np
import os
import matplotlib.pyplot as plt
from ImageClean import imageClean
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dense, Flatten
from tensorflow.keras.metrics import Precision, Recall, BinaryAccuracy

def create_model():
    model = Sequential([
        Conv2D(16, (3, 3), 1, activation='relu', input_shape=(256, 256, 3)),
        MaxPooling2D(),
        Conv2D(32, (3, 3), 1, activation='relu'),
        MaxPooling2D(),
        Conv2D(16, (3, 3), 1, activation='relu'),
        MaxPooling2D(),
        Flatten(),
        Dense(256, activation='relu'),
        Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss=tf.losses.BinaryCrossentropy(), metrics=['accuracy'])
    return model

def get_model_names():
    data_dir = 'uploads'
    subdirectories = [d.name for d in os.scandir(data_dir) if d.is_dir()]
    if len(subdirectories) != 2:
        raise ValueError("There must be exactly 2 subdirectories in the 'uploads' directory.")
    return subdirectories[0], subdirectories[1]

def train_model(image_type1, image_type2, model_name):
    print("Processing...")

    imageClean()


    data = tf.keras.utils.image_dataset_from_directory('uploads', image_size=(256, 256))
    data = data.map(lambda x, y: (x / 255.0, y))

    train_size = int(len(data) * 0.7)
    val_size = int(len(data) * 0.2)
    test_size = int(len(data) * 0.1) + 1

    train = data.take(train_size)
    val = data.skip(train_size).take(val_size)
    test = data.skip(train_size + val_size).take(test_size)
    print("here")

    # Define the model
    model = create_model()

    # Setup TensorBoard callback
    logdir = 'logs'
    tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=logdir)

    # Train the model
    hist = model.fit(train, epochs=20, validation_data=val, callbacks=[tensorboard_callback])

    # Create directories for saving the model and plots
    model_path = os.path.join('models', model_name + '.keras')
    os.makedirs('models', exist_ok=True)

    # Save the model
    model.save(model_path)

    # Save the training history
    np.save(os.path.join('results', model_name + '_training_history.npy'), hist.history)

    # Create directories for plots
    plot_dir = os.path.join('results', model_name + '_plots')
    os.makedirs(plot_dir, exist_ok=True)

    # Plot and save the training and validation loss
    fig = plt.figure()
    plt.plot(hist.history['loss'], color='teal', label='loss')
    plt.plot(hist.history['val_loss'], color='orange', label='val_loss')
    fig.suptitle('Loss', fontsize=20)
    plt.legend(loc="upper left")
    plt.savefig(os.path.join(plot_dir, 'loss_plot.png'))
    plt.show()

    # Plot and save the training and validation accuracy
    fig = plt.figure()
    plt.plot(hist.history['accuracy'], color='teal', label='accuracy')
    plt.plot(hist.history['val_accuracy'], color='orange', label='val_accuracy')
    fig.suptitle('Accuracy', fontsize=20)
    plt.legend(loc='upper left')
    plt.savefig(os.path.join(plot_dir, 'accuracy_plot.png'))
    plt.show()

    # Evaluate the model on the test set
    pre = Precision()
    re = Recall()
    acc = BinaryAccuracy()

    for batch in test.as_numpy_iterator():
        X, y = batch
        yhat = model.predict(X)
        pre.update_state(y, yhat)
        re.update_state(y, yhat)
        acc.update_state(y, yhat)

    print(f'Precision: {pre.result().numpy()}, Recall: {re.result().numpy()}, Accuracy: {acc.result().numpy()}')

    # Save evaluation metrics
    with open(os.path.join('results', model_name + '_evaluation_metrics.txt'), 'w') as f:
        f.write(f'Precision: {pre.result().numpy()}\n')
        f.write(f'Recall: {re.result().numpy()}\n')
        f.write(f'Accuracy: {acc.result().numpy()}\n')
        
    # Save filenames
    with open(os.path.join('models', model_name + '.txt'), 'w') as f:
        f.write(image_type1 +',' + image_type2)

