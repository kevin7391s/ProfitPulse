from keras import layers, models, metrics, optimizers, losses, regularizers

# Transformer model class that will handle the preparing, building, training, and running the model. 
class TransformerModel:
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



    # This function will build the model with creating the attention and feed forward layers
    # it then creates a global pooling average in a singular array then it will
    # have a final dense layer with 7 outputs that predicts 7 hours in advance.
    def build_model(self):
        try:

            features = ['Open', 'High', 'Low']
            input_shape = (self.backcandles, len(features))

            # Creating a variable to have the input for the model to be all the features and the amount of backcandles.
            inputs = layers.Input(shape = input_shape)

            # Attention layer that uses normalization during training, with having the inputs and set to the heads with
            # dropout of 10%
            attention_output = layers.MultiHeadAttention(num_heads = 2, key_dim= 2)(inputs, inputs)

            # Creating the feed forward layer that uses the previous attention layer to create two dense layers with 64
            # neurons that has one relu activation as it helps with the complex inputs and outputs as they are not
            # linear
            feedforward_output = layers.Dense(units = 256)(attention_output)
            feedforward_output = layers.Dropout(0.2)(feedforward_output)
            feedforward_output = layers.Dense(units = 128)(feedforward_output)
            
            # Variable to have a global average pooling that normalizes all the data and gathers the average and stores
            # the data into a 1D array
            global_avg_output = layers.GlobalAveragePooling1D()(feedforward_output)

            # Output dense layer that outputs 7 numbers which are the next 7 hours
            outputs = layers.Dense(7)(global_avg_output)
            optimizer = optimizers.Adam(learning_rate = 0.0001)

            # Sets the class object model variable to this model and compiles it 
            self.model = models.Model(inputs = inputs, outputs = outputs)
            self.model.compile(optimizer = optimizer, loss = losses.MeanSquaredError(), metrics=[metrics.MeanAbsoluteError(), metrics.RootMeanSquaredError(), metrics.R2Score])

        # Exceptions
        except ValueError as valueError:
            print(f"Value error in building transformer model: {valueError}")
        except TypeError as typeError:
            print(f"Type error in building transformer model: {typeError}")
        except MemoryError as memoryError:
            print(f"Memory error in building transformer model: {memoryError}")
        except RuntimeError as runtimeError:
            print(f"Runtime error in building transformer model: {runtimeError}")
        except ImportError as importError:
            print(f"ImportError in building transformer model: {importError}")
        except Exception as exception:
            print(f"Unexpected error in building transformer model: {exception}")



        # Train model allows the model to begin working with 20% validation.
    def train_model(self):
        try:
            self.history = self.model.fit(self.X_train, self.y_train, batch_size = 3, epochs = 40, validation_split = 0.2, verbose=2)
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
            print(f"Value error in training transformer model: {valueError}")
        except TypeError as typeError:
            print(f"Type error in training transformer model: {typeError}")
        except MemoryError as memoryError:
            print(f"Memory error in training transformer model: {memoryError}")
        except RuntimeError as runtimeError:
            print(f"Runtime error in training transformer model: {runtimeError}")
        except Exception as exception:
            print(f"Unexpected error in training transformer model: {exception}")
        


    def run_model(self):
        self.build_model()
        self.train_model()