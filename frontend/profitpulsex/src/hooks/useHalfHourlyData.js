import { useEffect, useState } from "react";
import axios from "axios";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const useSpecificStockData = (symbol) => {
  // state variables for setting stock,  prediction data, loading and errors
  const [specificTimesStockData, setSpecificTimesStockData] = useState([]);
  const [predictedHourlyData, setPredictedHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Api and cache duration of 24 hours
  const apiKey = "ZLEF4DDCNCJGHU3I";
  const cacheDuration = 24 * 60 * 60 * 1000;

  // function to get last market day
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
    // if monday go back to friday
    if (localDay === 1) {
      localDate.setDate(localDate.getDate() - 3);
    }
    // if sunday go back to friday
    else if (localDay === 0) {
      localDate.setDate(localDate.getDate() - 2);
    }
    // if saturday, go back to friday
    else if (localDay === 6) {
      localDate.setDate(localDate.getDate() - 1);
    }
    // all other days go back one previous market day
    else {
      localDate.setDate(localDate.getDate() - 1);
    }
    return localDate.toLocaleDateString("en-CA");
  };

  // filter to times relevant to prediction data
  const filterSpecificTimes = (data, lastMarketDay) => {
    const specificTimes = [
      "10:30:00",
      "11:30:00",
      "12:30:00",
      "13:30:00",
      "14:30:00",
      "15:30:00",
      "16:30:00",
    ];

    return Object.keys(data)
      .filter((timestamp) => {
        const [date, time] = timestamp.split(" ");
        return date === lastMarketDay && specificTimes.includes(time);
      })
      .map((timestamp) => ({
        time: timestamp,
        close: parseFloat(data[timestamp]["4. close"]),
      }));
  };

  // fetches hourly prediction data from firestore
  const fetchPredictionData = async (symbol, lastMarketDay) => {
    const predictionsRef = doc(db, "predictions", symbol);

    try {
      const predictionsSnapshot = await getDoc(predictionsRef);
      if (predictionsSnapshot.exists()) {
        const predictions = predictionsSnapshot.data();
        const hourlyPredictions = predictions.predictions || [];

        // Align predictions with specific times
        const alignedPredictions = hourlyPredictions
          .filter((prediction) =>
            prediction.predicted_time.startsWith(lastMarketDay)
          )
          .map((prediction) => ({
            time: prediction.predicted_time,
            average: parseFloat(prediction.predictions_average),
            lstm: parseFloat(prediction.lstm_predicted_price),
            transformer: parseFloat(prediction.transformer_predicted_price),
          }));

        setPredictedHourlyData(alignedPredictions);
      } else {
        console.warn("No hourly prediction data found in Firestore.");
        setPredictedHourlyData([]);
      }
    } catch (error) {
      console.error("Error fetching hourly prediction data:", error);
      setError(`Failed to fetch prediction data for ${symbol}`);
    }
  };

  // fetches data from cache or API based on cache duration
  const fetchSpecificStockData = async () => {
    setLoading(true);
    setError(null);

    const lastMarketDay = getLastMarketDay();
    const docRef = doc(
      db,
      "specificTimesStockData",
      `${symbol}-${lastMarketDay}`
    );
    const now = Date.now();

    try {
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const cachedData = docSnapshot.data();

        if (now - cachedData.timestamp < cacheDuration) {
          console.log(`Using cached data for ${symbol} - ${lastMarketDay}`);
          setSpecificTimesStockData(cachedData.data);
          await fetchPredictionData(symbol, lastMarketDay);
          setLoading(false);
          return;
        }
      }

      console.log("Fetching new data from API.");
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=30min&apikey=${apiKey}`
      );

      // filter API data for specific times
      if (!response.data["Time Series (30min)"]) {
        throw new Error(`API response invalid for ${symbol}`);
      }

      const data = response.data["Time Series (30min)"];
      const filteredData = filterSpecificTimes(data, lastMarketDay);

      // cache data in firestore
      await setDoc(docRef, {
        data: filteredData,
        lastMarketDay,
        timestamp: now,
      });

      setSpecificTimesStockData(filteredData);
      await fetchPredictionData(symbol, lastMarketDay);
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);

      // in case of API failure, use data from firestore
      const fallbackSnapshot = await getDoc(docRef);
      if (fallbackSnapshot.exists()) {
        console.warn("Using fallback data from Firestore.");
        setSpecificTimesStockData(fallbackSnapshot.data().data || []);
        await fetchPredictionData(symbol, lastMarketDay);
      } else {
        console.error("No fallback data available in Firestore.");
        setSpecificTimesStockData([]);
      }
      setError(`Failed to fetch stock data for ${symbol}`);
    } finally {
      setLoading(false);
    }
  };

  // fetch specific  data when card click changes
  useEffect(() => {
    fetchSpecificStockData();
  }, [symbol]);

  return { specificTimesStockData, predictedHourlyData, loading, error };
};

export default useSpecificStockData;
