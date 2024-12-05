import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const useStockData = (symbol) => {
  const [stockData, setStockData] = useState([]);
  const [weeklyPredictedData, setWeeklyPredictedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = "ZLEF4DDCNCJGHU3I";

  // cache duration for 24 hours
  const cacheDuration = 24 * 60 * 60 * 1000;

  // function to get last market day base on date
  const getLastMarketDay = () => {
    const today = new Date();
    const localDate = new Date(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(today)
    );

    const localDay = localDate.getDay();
    if (localDay === 1) {
      // If today is Monday, go back to Friday
      localDate.setDate(localDate.getDate() - 3);
    } else if (localDay === 0) {
      // If today is Sunday, go back to Friday
      localDate.setDate(localDate.getDate() - 2);
    } else if (localDay === 6) {
      // If today is Saturday, go back to Friday
      localDate.setDate(localDate.getDate() - 1);
    } else {
      // For all other days, go back to the previous day
      localDate.setDate(localDate.getDate() - 1);
    }
    return localDate.toLocaleDateString("en-CA"); // Return date in yyyy-mm-dd format
  };

  // fetch prediciton data from firestore
  const fetchPredictionData = async (symbol) => {
    const predictionsRef = doc(db, "predictions", symbol);

    try {
      const predictionsSnapshot = await getDoc(predictionsRef);
      if (predictionsSnapshot.exists()) {
        const predictions = predictionsSnapshot.data();

        // Fetch Weekly predictions data and format
        const weeklyPredictions = predictions.daily_average || [];
        const weeklyPredictionData = weeklyPredictions.map((data) => ({
          date: data.date,
          close: data.daily_average,
        }));
        setWeeklyPredictedData(weeklyPredictionData);
      } else {
        console.warn("No prediction data found in Firestore for this symbol.");
        setWeeklyPredictedData([]);
      }
    } catch (error) {
      console.error("Error fetching prediction data:", error);
    }
  };

  // fetch stock data from firestore or API based on cache duration
  const fetchStockData = useCallback(async () => {
    const docRef = doc(db, "stockData", `${symbol}-combined`);
    const now = Date.now();
    const lastMarketDay = getLastMarketDay();

    try {
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const stockInfo = docSnapshot.data();
        if (
          now - stockInfo.timestamp < cacheDuration &&
          stockInfo.lastMarketDay === lastMarketDay
        ) {
          console.log(`Using cached data for ${symbol}`);
          setStockData(stockInfo.weeklyData);
          setLoading(false);
          return;
        }
      }

      console.log("Cache is outdated or not found. Fetching new stock data.");
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
      );

      if (!response.data["Time Series (Daily)"]) {
        throw new Error(`API response invalid for ${symbol}`);
      }

      // fetch last 7 days worth of stock data
      const data = response.data["Time Series (Daily)"];
      const lastSevenDays = Object.keys(data)
        .sort((a, b) => new Date(b) - new Date(a))
        .slice(0, 7)
        .map((date) => ({
          date,
          close: parseFloat(data[date]["4. close"]),
        }));

      // cache fetched data in firestore
      await setDoc(docRef, {
        weeklyData: lastSevenDays,
        lastMarketDay,
        timestamp: now,
      });

      setStockData(lastSevenDays);
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      setError(`Failed to fetch stock data for ${symbol}`);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // fetch stock and prediciton data when symbol changes
  useEffect(() => {
    fetchStockData();
    fetchPredictionData(symbol);
  }, [fetchStockData, symbol]);

  // return stock and prediction data as well as error states
  return {
    stockData,
    weeklyPredictedData,
    loading,
    error,
  };
};

export default useStockData;
