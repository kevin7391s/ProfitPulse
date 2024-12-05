import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Card from "../component/card";
import Chart from "../component/Chart";
import HourlyChart from "../component/HourlyChart";
import StockPortfolioPopup from "../component/StockPortfolioPopup";
import fetchPredictions from "../hooks/fetchPredictionData";
import DataModal from "../component/dataModal";
import useDailyAveragePrediction from "../hooks/useDailyAveragePrediction";
import PortfolioPieChart from "../component/PortfolioPieChart";

// Function to fetch stock profile data
const fetchStockData = async (symbol) => {
  const apiKey = "crnnk0hr01qt44di7ng0crnnk0hr01qt44di7ngg";
  const response = await fetch(
    `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};

// Function to fetch current stock price
const fetchCurrentPrice = async (symbol) => {
  const apiKey = "crnnk0hr01qt44di7ng0crnnk0hr01qt44di7ngg";
  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
};

function Dashboard() {
  // State variables for stock data, prices, predictions, user data, etc.
  const [stockData, setStockData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [percentChange, setPercentChange] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [teslaPrice, setTeslaPrice] = useState(null);
  const [gmPrice, setGmPrice] = useState(null);
  const [fordPrice, setFordPrice] = useState(null);
  const [error, setError] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [selectedStock, setSelectedStock] = useState("TSLA");
  const [isWeekly, setIsWeekly] = useState(true);
  const [portfolioData, setPortfolioData] = useState({ TSLA: 0, GM: 0, F: 0 });
  const [currentPrices, setCurrentPrices] = useState({
    TSLA: null,
    GM: null,
    F: null,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [predictedPricesToday, setPredictedPricesToday] = useState([]);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const { dailyAverage, error: dailyAverageError } =
    useDailyAveragePrediction(selectedStock);
  const [expectedValue, setExpectedValue] = useState(null);
  const [isExpectedValueVisible, setIsExpectedValueVisible] = useState(false);

  // Handle the selection of stock card
  const handleCardClick = (symbol) => {
    setSelectedStock(symbol);
    fetchStocks(symbol);
  };

  // Fetch stock profile, current prices, and predicted prices
  const fetchStocks = async (symbol) => {
    try {
      const data = await fetchStockData(symbol);
      setStockData(data);
      setError(null);
      const priceData = await fetchCurrentPrice(symbol);
      setCurrentPrice(priceData.c);
      setPriceChange(priceData.d);
      setPercentChange(priceData.dp);

      const predictedPrice = await fetchPredictedPrice(symbol);
      setPredictedPrice(predictedPrice);
    } catch (err) {
      setError("Failed to fetch stock data.");
      setStockData(null);
      setCurrentPrice(null);
      setPriceChange(null);
      setPercentChange(null);
      setPredictedPrice(null);
    }
  };
  // Fetch prices for Tesla, GM, and Ford
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const teslaData = await fetchCurrentPrice("TSLA");
        const gmData = await fetchCurrentPrice("GM");
        const fordData = await fetchCurrentPrice("F");

        setTeslaPrice(teslaData.c.toFixed(2));
        setGmPrice(gmData.c.toFixed(2));
        setFordPrice(fordData.c.toFixed(2));
        setCurrentPrices({
          TSLA: teslaData.c.toFixed(2),
          GM: gmData.c.toFixed(2),
          F: fordData.c.toFixed(2),
        });
      } catch (err) {
        console.error("Failed to fetch stock prices", err);
      }
    };

    fetchPrices();
  }, []);

  // Toggle between weekly and hourly chart views
  const toggleChart = () => {
    setIsWeekly(!isWeekly);
  };

  // Firebase authentication and user portfolio data fetching
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  // Fetch user's portfolio data from Firebase
  const fetchPortfolioData = async () => {
    if (!userId) return;
    const portfolioDocRef = doc(db, "users", userId, "portfolio", "stocks");

    try {
      const docSnap = await getDoc(portfolioDocRef);
      if (docSnap.exists()) {
        setPortfolioData(docSnap.data());
        console.log("Portfolio data fetched:", docSnap.data());
      } else {
        console.log("No portfolio data found for this user.");
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    }
  };

  // Fetch portfolio data on component mount
  useEffect(() => {
    fetchPortfolioData();
  }, []);

  // Open and close the portfolio popup
  const handlePopupOpen = () => setIsPopupOpen(true);
  const handlePopupClose = () => setIsPopupOpen(false);

  // Fetch and display prediction data for the selected stock
  const fetchAndDisplayPredictionData = async (stockSymbol) => {
    try {
      const predictions = await fetchPredictions(stockSymbol);
      setPredictedPricesToday(predictions);
      setIsDataModalOpen(true);
    } catch (error) {
      console.error("Error fetching prediction data:", error);
    }
  };

  // Calculate expected profit or savings
  const calculateExpectedValue = (dailyAverage, currentPrice) => {
    const priceDiff = Math.abs(dailyAverage - currentPrice);
    const percentageChange = ((priceDiff / currentPrice) * 100).toFixed(2);

    if (dailyAverage > currentPrice) {
      return `Expected Profit per Share: $${priceDiff.toFixed(
        2
      )} (${percentageChange}%)`;
    } else {
      return `Expected Savings per Share: $${priceDiff.toFixed(
        2
      )} (${percentageChange}%)`;
    }
  };

  // Update expected value and recommendation after a delay
  useEffect(() => {
    if (dailyAverage && currentPrices[selectedStock]) {
      const currentPrice = parseFloat(currentPrices[selectedStock]);

      // Clear the visibility initially when the selected stock changes
      setIsExpectedValueVisible(false);

      const timeoutId = setTimeout(() => {
        if (
          dailyAverage &&
          currentPrices[selectedStock] === currentPrice.toString()
        ) {
          if (dailyAverage > currentPrice) {
            setRecommendation("Buy");
          } else {
            setRecommendation("Sell");
          }
          setExpectedValue(calculateExpectedValue(dailyAverage, currentPrice));
          setIsExpectedValueVisible(true);
        }
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [dailyAverage, selectedStock, currentPrices]);

  // Render UI with stock cards, charts, portfolio, and sentiment analysis
  return (
    <div className="grid grid-rows-1 gap-6 p-8 font-body relative bg-bgdark text-white">
      {/* Stock Cards */}
      <div className="col-span-4 grid grid-cols-3 gap-6">
        {["TSLA", "GM", "F"].map((symbol) => (
          <div
            key={symbol}
            className={`text-center cursor-pointer p-4 rounded-lg border-2 ${
              selectedStock === symbol
                ? "border-lightgreen"
                : "border-gray-700 hover:border-lightgreen"
            } transition-all duration-200`}
            onClick={() => handleCardClick(symbol)}
          >
            <Card selected={selectedStock === symbol}>
              <div className="text-2xl font-heading">{symbol}</div>
              <div className="mt-4 text-sm text-gray-400">Current Price:</div>
              <div className="text-xl font-semibold text-lightgreen">
                {symbol === "TSLA"
                  ? `$${teslaPrice || "Loading..."}`
                  : symbol === "GM"
                  ? `$${gmPrice || "Loading..."}`
                  : `$${fordPrice || "Loading..."}`}{" "}
                USD
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div
        className="col-span-4 row-span-4 bg-gray-800 p-6 rounded-lg shadow-lg"
        style={{ maxHeight: "1000px", overflowY: "auto" }}
      >
        <button
          onClick={toggleChart}
          className="bg-lightgreen font-body text-black text-md px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none mb-6 transition-all duration-200"
        >
          {isWeekly ? "Switch to Hourly Chart" : "Switch to Weekly Chart"}
        </button>

        <div className="relative">
          {/* Both charts mounted, visibility toggled */}
          <div
            style={{
              display: isWeekly ? "block" : "none",
              position: isWeekly ? "relative" : "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            <Chart symbol={selectedStock} />
          </div>

          <div
            style={{
              display: isWeekly ? "none" : "block",
              position: isWeekly ? "absolute" : "relative",
              width: "100%",
              height: "100%",
            }}
          >
            <HourlyChart symbol={selectedStock} />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-6 col-span-4 row-span-2">
        {/* Stock Portfolio */}
        <div className="col-span-1">
          <Card className="bg-gray-800 p-6 rounded-lg shadow-lg h-[350px] flex items-center justify-between">
            {/* Left Section: Portfolio Data */}
            <div className="flex flex-col justify-center ml-10">
              <button
                onClick={handlePopupOpen}
                className="bg-lightgreen font-body text-black text-lg px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none mb-4 transition-all duration-200"
              >
                Manage Portfolio
              </button>
              <h2 className="font-heading text-2xl mb-4 text-white ">
                User Stock Portfolio
              </h2>
              <div className="text-sm text-gray-400">
                {["TSLA", "GM", "F"].map((symbol) => (
                  <div key={symbol} className="mt-2">
                    <p className="font-medium text-xl text-white">
                      {symbol} - Shares: {portfolioData[symbol] || 0}
                    </p>
                    <p className="text-l">
                      Total Value:{" "}
                      <span className="text-lightgreen font-semibold">
                        $
                        {(
                          (portfolioData[symbol] || 0) *
                          (currentPrices[symbol] || 0)
                        ).toFixed(2)}{" "}
                        USD
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section: Pie Chart */}
            <div className=" mr-10">
              <PortfolioPieChart data={portfolioData} prices={currentPrices} />
            </div>
          </Card>

          {isPopupOpen && (
            <StockPortfolioPopup
              portfolioData={portfolioData}
              currentPrices={currentPrices}
              onClose={handlePopupClose}
              refreshData={fetchPortfolioData}
            />
          )}
        </div>

        {/* Prediction Prices */}
        <div className="col-span-1">
          <Card className="bg-gray-800 p-6 rounded-lg shadow-lg h-[350px] flex flex-col justify-between">
            <div className="text-center">
              <button
                onClick={() => fetchAndDisplayPredictionData(selectedStock)}
                className="bg-lightgreen font-body text-black text-lg px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none mb-6 transition-all duration-200 mt-2"
              >
                Current Market Day Predictions
              </button>
              {dailyAverage !== null ? (
                <div>
                  <h2 className="font-heading text-2xl text-white mb-8">
                    Prediction Prices for Next Market Day
                  </h2>

                  <p className="text-textcolor text-xl">
                    Average Predicted Price:{" "}
                    <span className="font-bold font-body">
                      ${dailyAverage.toFixed(2)}
                    </span>
                  </p>
                  <p
                    className={`font-bold mt-3 text-xl ${
                      recommendation === "Buy"
                        ? "text-lightgreen font-body"
                        : "text-boldred font-body"
                    }`}
                  >
                    Recommendation: {recommendation}
                  </p>
                  <p className="text-textcolor mt-4 text-lg font-body">
                    {isExpectedValueVisible ? (
                      recommendation === "Buy" ? (
                        <>
                          Expected Profit Per Share:{" "}
                          <span className="text-lightgreen font-body">
                            $
                            {(
                              dailyAverage -
                              parseFloat(currentPrices[selectedStock] || 0)
                            ).toFixed(2)}{" "}
                            (
                            {(
                              ((dailyAverage -
                                parseFloat(currentPrices[selectedStock] || 0)) /
                                parseFloat(currentPrices[selectedStock] || 1)) *
                              100
                            ).toFixed(2)}
                            %)
                          </span>
                        </>
                      ) : (
                        <>
                          Expected Savings Per Share Sold:{" "}
                          <span className="text-lightgreen font-semibold">
                            $
                            {(
                              parseFloat(currentPrices[selectedStock] || 0) -
                              dailyAverage
                            ).toFixed(2)}{" "}
                            (
                            {(
                              ((parseFloat(currentPrices[selectedStock] || 0) -
                                dailyAverage) /
                                dailyAverage) *
                              100
                            ).toFixed(2)}
                            %)
                          </span>
                        </>
                      )
                    ) : (
                      <span className="text-gray-400">Calculating...</span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-lg">
                  {dailyAverageError || "No data available"}
                </p>
              )}
            </div>
          </Card>
        </div>
        {/* Data Modal */}
        {isDataModalOpen && (
          <DataModal
            isOpen={isDataModalOpen}
            onClose={() => setIsDataModalOpen(false)}
            data={predictedPricesToday}
            stockSymbol={selectedStock}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
