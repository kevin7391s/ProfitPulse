import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
// Function to get the next market day in "YYYY-MM-DD" format.
const getNextMarketDay = () => {
  const today = new Date();
  // Convert to Eastern Time Zone
  const easternTime = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(today)
  );
  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = easternTime.getDay();
  // Calculate the next market day
  if (dayOfWeek === 5) {
    // If it's Friday, next market day is Monday
    easternTime.setDate(easternTime.getDate() + 3);
  } else if (dayOfWeek === 6) {
    // If it's Saturday, next market day is Monday
    easternTime.setDate(easternTime.getDate() + 2);
  } else {
    // Any other weekday (Monday to Thursday), neext market day is the next day
    easternTime.setDate(easternTime.getDate() + 1);
  }
  easternTime.setHours(easternTime.getHours() - 5);
  return easternTime.toISOString().split("T")[0];
};
// Custom hook to fetch daily average prediciton prices
const useDailyAveragePrediction = (symbol) => {
  const [dailyAverage, setDailyAverage] = useState(null);
  const [error, setError] = useState(null);
  console.log("Next Market Day (Eastern Time):", getNextMarketDay());
  useEffect(() => {
    const fetchDailyAverage = async () => {
      try {
        const stockDocRef = doc(db, "predictions", symbol);
        const stockDocSnap = await getDoc(stockDocRef);
        if (stockDocSnap.exists()) {
          const data = stockDocSnap.data().daily_average || [];
          // Get the next market day
          const nextMarketDateString = getNextMarketDay();
          console.log(
            "Next Market Date (nextMarketDateString):",
            nextMarketDateString
          );
          // Match next market day
          const predictionForNextMarketDay = data.find(
            (entry) => entry.date === nextMarketDateString
          );
          if (predictionForNextMarketDay) {
            setDailyAverage(predictionForNextMarketDay.daily_average);
          } else {
            // removed No prediction data available for the next market day.
            setError("");
            setDailyAverage(null);
          }
        } else {
          setError(`No data found for stock ${symbol}`);
          setDailyAverage(null);
        }
      } catch (error) {
        console.error("Error fetching daily average prediction:", error);
        setError("Error fetching daily average prediction data.");
      }
    };
    if (symbol) {
      fetchDailyAverage();
    }
  }, [symbol]);
  return { dailyAverage, error };
};
export default useDailyAveragePrediction;
