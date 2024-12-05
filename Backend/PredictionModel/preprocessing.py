from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pandas_ta as ta
import numpy as np

# Class that processes stock and allows instances for each ticker
class ProcessedStock:
    def __init__(self, data):
        self.data = data
        self.feature_scaler = None
        self.target_scaler = None

    def process_stock_data(self, data):
        try:
            # Dropping any null values within dataset
            data.dropna(inplace=True)

            # Separate features and targets for scaling
            features = data[['Open', 'High', 'Low']]
            target = data[['Adj Close']]

            # Initialize the scalers to the object
            self.feature_scaler = StandardScaler()
            self.target_scaler = StandardScaler()

            # Scale both features and targets
            scaled_features = self.feature_scaler.fit_transform(features)
            scaled_target = self.target_scaler.fit_transform(target)

            self.data = np.hstack((scaled_features, scaled_target))

            return self.data
        
        except KeyError as keyError:
            print(f"Key error in processing stock data: {keyError}")
        except ValueError as valueError:
            print(f"Value error in processing stock data: {valueError}")
        except TypeError as typeError:
            print(f"Type error in processing stock data: {typeError}")
        except Exception as exception:
            print(f"Exception error in processing stock data: {exception}")

def ProcessData(data):
    try:
        scaled_data = ProcessedStock(data)
        processed_stock = scaled_data.process_stock_data(data)

        # Backcandles for values specifiying how many data points within each index in X array
        # Futurecandles for values specifiying how many data points for the future predictions in Y array
        backcandles = 21
        futurecandles = 7
        X = []
        y = []

        # Appending all the data for each of the X array based on the backcandles and futurecandles
        for i in range(backcandles, processed_stock.shape[0] - futurecandles):
            X.append(processed_stock[i-backcandles:i, :3])
            y.append(processed_stock[i:i + futurecandles, 3])   

        # Appending both arrays to numpy array so it may be used for data splitting
        X = np.array(X)
        y = np.array(y)
        y = np.reshape(y, (y.shape[0], futurecandles))

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size= 0.2, shuffle=False)
        return X_train, X_test, y_train, y_test, backcandles, scaled_data.target_scaler

    except ValueError as valueError:
        print(f"Value error in processing scaled data: {valueError}")
    except TypeError as typeError:
        print(f"Type error in processing scaled data: {typeError}")
    except Exception as exception:
        print(f"Exception Error in processing scaled data: {exception}")