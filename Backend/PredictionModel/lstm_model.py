import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
from keras import layers, models, metrics, Input, optimizers, losses, regularizers

# LSTM model class that will handle the preparing, building, training, and running the model. 
class LSTMmodel:
    def __init__(self, X_train, X_test, y_train, y_test, backcandles):
        self.X_train = X_train
        self.X_test = X_test
        self.y_train = y_train
        self.y_test = y_test
        self.backcandles = backcandles
        self.model = None
        self.history = None
        self.train_loss = None
        self.val_loss = None
        self.train_mae = None
        self.val_mae = None
        self.train_rmse = None
        self.val_rmse = None
        self.train_r2 = None
        self.val_r2 = None
        self.test_loss = None
        self.test_mae = None
        self.test_rmse = None
        self.test_r2 = None
        self.avg_train_loss = None
        self.avg_val_loss = None
        self.avg_train_mae = None
        self.avg_val_mae = None
        self.avg_train_rmse = None
        self.avg_val_rmse = None
        self.avg_train_r2 = None
        self.avg_val_r2 = None
        self.avg_metrics = {}

    # Builds the model based off of all the features and predicts 7 hours ahead. 
    def build_model(self):
        try:
            features = ['Open', 'High', 'Low']


            self.model = models.Sequential()

            # Add layers that have 160 and 128 neutrons respectively, and have a dropout rate of 10%, and
            # batch normalize after the relu activation. 
            self.model.add(Input(shape=(self.backcandles, len(features))))
            self.model.add(layers.MaxPooling1D(pool_size=2))
            self.model.add(layers.LSTM(units=128, return_sequences=True))
            self.model.add(layers.LSTM(units=64, return_sequences=True))
            self.model.add(layers.Dropout(0.2))
            self.model.add(layers.LSTM(units=32, return_sequences=False))

            # Using a 64 layer that uses relu for activation, then normalizes the data to allow the model to create a
            # dense layer that outputs 7 values which are the predictions
            self.model.add(layers.Dense(units=32))
            self.model.add(layers.BatchNormalization())
            self.model.add(layers.Dense(units=7))

            optimizer = optimizers.Adam(learning_rate = 0.0001)

            # After training, the model compiles using mean squared error as the loss value and uses Adam optimizer 
            self.model.compile( optimizer= optimizer, loss=losses.MeanSquaredError() , metrics=[metrics.MeanAbsoluteError(), metrics.RootMeanSquaredError(), metrics.R2Score()])

        # Exceptions
        except ValueError as valueError:
            print(f"Value error in building lstm model: {valueError}")
        except TypeError as typeError:
            print(f"Type error in building lstm model: {typeError}")
        except MemoryError as memoryError:
            print(f"Memory error in building lstm model: {memoryError}")
        except RuntimeError as runtimeError:
            print(f"Runtime error in building lstm model: {runtimeError}")
        except ImportError as importError:
            print(f"ImportError in building lstm model: {importError}")
        except Exception as exception:
            print(f"Unexpected error in building lstm model: {exception}")

    # Training the model to fit with 20% validation
    def train_model(self):
        try:

            self.history = self.model.fit(self.X_train, self.y_train, batch_size=3, epochs=25, validation_split=0.2, verbose=2)
            self.train_loss = self.history.history['loss']
            self.val_loss = self.history.history['val_loss']
            self.train_mae = self.history.history['mean_absolute_error']
            self.val_mae = self.history.history['val_mean_absolute_error']
            self.train_rmse = self.history.history['root_mean_squared_error']
            self.val_rmse = self.history.history['val_root_mean_squared_error']
            self.train_r2 = self.history.history['r2_score']
            self.val_r2 = self.history.history['val_r2_score']

            # Calculate averages for each metric
            self.avg_train_loss = sum(self.train_loss) / len(self.train_loss)
            self.avg_val_loss = sum(self.val_loss) / len(self.val_loss)
            self.avg_train_mae = sum(self.train_mae) / len(self.train_mae)
            self.avg_val_mae = sum(self.val_mae) / len(self.val_mae)
            self.avg_train_rmse = sum(self.train_rmse) / len(self.train_rmse)
            self.avg_val_rmse = sum(self.val_rmse) / len(self.val_rmse)
            self.avg_train_r2 = sum(self.train_r2) / len(self.train_r2)
            self.avg_val_r2 = sum(self.val_r2) / len(self.val_r2)

            self.avg_metrics = {"avg_train_loss": self.avg_train_loss, "avg_val_loss": self.avg_val_loss,
                "avg_train_mae": self.avg_train_mae, "avg_val_mae": self.avg_val_mae,
                "avg_train_rmse": self.avg_train_rmse, "avg_val_rmse": self.avg_val_rmse,
                "avg_train_r2": self.avg_train_r2, "avg_val_r2": self.avg_val_r2}
        
        # Exceptions
        except ValueError as valueError:
            print(f"Value error in training lstm model: {valueError}")
        except TypeError as typeError:
            print(f"Type error in training lstm model: {typeError}")
        except MemoryError as memoryError:
            print(f"Memory error in training lstm model: {memoryError}")
        except RuntimeError as runtimeError:
            print(f"Runtime error in training lstm model: {runtimeError}")
        except Exception as exception:
            print(f"Unexpected error in training lstm model: {exception}")

    def run_model(self):
        try:
            self.build_model()
            self.train_model()
        except Exception as exception:
            print(f"Exception occurred in run lstm model: {exception}")