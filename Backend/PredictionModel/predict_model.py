import stock_api
import preprocessing
from lstm_model import LSTMmodel
from transformer_model import TransformerModel
import json
from datetime import datetime, timedelta, time
import pandas as pd

# From the current time, it will find the next time within the specific time range from 9:30 - 16:30
def find_next_time(current_time, specific_times):
    specific_times = [datetime.strptime(t, "%H:%M").time() for t in specific_times]
    current_time_only = current_time.time()

    for t in specific_times:
        if current_time_only < t:
            return datetime.combine(current_time.date(), t)

    # If no time is found, wrap around to the first time on the next day
    return datetime.combine(current_time.date() + timedelta(days=1), specific_times[0])

# Get the trading hours from the current time and exclude weekends and off hours
def generate_trading_hours():
    specific_times = ["09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30"]
    start_time = time(9, 30)
    end_time = time(16, 30)

    current_time = datetime.now()
    trading_hours = []

    # Skip weekends
    while current_time.weekday() >= 5:
        current_time += timedelta(days=1)

    # Generate the next 7 trading hours
    while len(trading_hours) < 7:
        if start_time <= current_time.time() <= end_time:
            next_time = find_next_time(current_time, specific_times)
            trading_hours.append(next_time.strftime('%Y-%m-%d %H:%M:%S'))
            current_time = next_time
        else:
            # Move to the next trading day
            if current_time.time() > end_time:
                current_time = datetime.combine(current_time.date() + timedelta(days=1), start_time)
            else:
                current_time = datetime.combine(current_time.date(), start_time)

    return trading_hours


class PredictionModel:
    def __init__(self, ticker):
        self.ticker = ticker
        self.stock_predictions = {}

    def build_train_predict_model(self):
        try:


            # Traverse through each ticker and run the functions
            data = stock_api.DownloadData(self.ticker)

            # Get the scaled data and get the target scaler to un-scale later
            X_train, X_test, y_train, y_test, backcandles, target_scaler = preprocessing.ProcessData(data)
                
            # Give the LSTMmodel object the required parameters to train and run model
            lstm_model = LSTMmodel(X_train, X_test, y_train, y_test, backcandles)
            lstm_model.run_model()
            lstm_predictions = lstm_model.model.predict(X_test)

            transformer_model = TransformerModel(X_train, X_test, y_train, y_test, backcandles)
            transformer_model.run_model()
            transformer_predictions = transformer_model.model.predict(X_test)

            # Extract the next 7 future targets from the predictions
            lstm_future_candles_scaled = lstm_predictions[-1]
            transformer_future_candles_scaled = transformer_predictions[-1]
        
            # Un-scale the future target predictions
            lstm_future_candles_unscaled = target_scaler.inverse_transform(lstm_future_candles_scaled.reshape(-1, 1)).flatten()
            transformer_future_candles_unscaled = target_scaler.inverse_transform(transformer_future_candles_scaled.reshape(-1, 1)).flatten()

            # Generate timestamps for the next 7 trading hours
            trading_hours = generate_trading_hours()
            date = trading_hours[0][:10]

            lstm_predictions = lstm_future_candles_unscaled.tolist()
            transformer_predictions = transformer_future_candles_unscaled.tolist()

            predictions_average = []
            for lstm_pred, transformer_pred in zip(lstm_predictions, transformer_predictions):
                avg_pred = (lstm_pred + transformer_pred) / 2
                predictions_average.append(avg_pred)

            sum = 0
            for average in predictions_average:
                sum += average
            daily_average = sum / 7

            self.stock_predictions[self.ticker] = {
                "time": trading_hours,
                "lstm_predictions" : lstm_predictions,
                "lstm_avg_metrics" : lstm_model.avg_metrics,
                "transformer_predictions" : transformer_predictions,
                "transformer_avg_metrics" : transformer_model.avg_metrics,
                "predictions_average": predictions_average,
                "daily_average": daily_average,
                "date": date,
            }

        except Exception as exception:
            print(f"Error during building prediction model: {exception}")
            self.stock_predictions[self.ticker] =  {"Error" : str(exception)}

    def prediction_to_json(self):
        try:
            stock_predictions_json = json.dumps(self.stock_predictions)
            return stock_predictions_json
        
        except Exception as exception:
            print(f"Error during prediction to JSON:  {exception}")
            return json.dumps({"Error" : str(exception)})