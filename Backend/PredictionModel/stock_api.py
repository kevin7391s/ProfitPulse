import yfinance as yf

# Stock class that will modularize downloads and allow objects that are pandas dataframes
class Stock:
    #Object initializer with ticker as identifier
    def __init__(self,ticker):
        self.ticker = ticker
        self.data = None

    # API data downloader function with a 2 year period with 1 hour intervals
    def download_data(self):
        try:
            self.data = yf.download(self.ticker, period='2y', interval='1h')
            if self.data.empty:
                raise ValueError("No data has been found for the ticker and time period")
        
        # Error handling
        except ValueError as valueError:
            print(f"Value error downloading data for {self.ticker}: {valueError}")
        except ImportError as importError:
            print(f"Import error downloading data for {self.ticker}: {importError}")
        except Exception as e:
            print(f"Error downloading data for {self.ticker}: {e}")

        return self.data



# Downloading the data as specified ticker as parameter
def DownloadData(ticker):
    try:
        stock = Stock(ticker)
        stock_data = stock.download_data()

        return stock_data
    
    # Error Handling
    except Exception as exception:
        print(f"Error in downloading data for {ticker}: {exception}")
        return None