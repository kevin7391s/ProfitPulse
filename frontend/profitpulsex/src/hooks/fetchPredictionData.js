import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const fetchPredictions = async (symbol) => {
  try {
    //  date in Eastern Time Zone
    const today = new Date();
    const easternTimeString = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(today);

    const [month, day, year] = easternTimeString.split(",")[0].split("/");
    const todayDate = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00-05:00`
    );

    // calculate the next market day
    let nextMarketDate = new Date(todayDate);
    const dayOfWeek = nextMarketDate.getDay();

    // Adjust to the next market day: skip weekends
    if (dayOfWeek === 5) {
      nextMarketDate.setDate(nextMarketDate.getDate() + 3);
    } else if (dayOfWeek === 6) {
      nextMarketDate.setDate(nextMarketDate.getDate() + 2);
    } else {
      nextMarketDate.setDate(nextMarketDate.getDate() + 0);
    }

    // format next market days data
    const nextMarketDateString = nextMarketDate.toISOString().split("T")[0];
    console.log(
      "Next Market Date (nextMarketDateString):",
      nextMarketDateString
    );

    // retrive predictions document
    const stockDocRef = doc(db, "predictions", symbol);
    const stockDocSnap = await getDoc(stockDocRef);

    if (stockDocSnap.exists()) {
      // access the predicitons data
      const data = stockDocSnap.data().predictions || [];
      console.log("Raw predictions data:", data);

      // filter the market data for next market days to display
      const nextDayPredictions = data.filter((prediction) => {
        const predictionDate = prediction.predicted_time.split(" ")[0];
        console.log(
          "Comparing predictionDate:",
          predictionDate,
          "with nextMarketDateString:",
          nextMarketDateString
        );
        return predictionDate === nextMarketDateString;
      });

      console.log(
        "Filtered predictions for next market day:",
        nextDayPredictions
      );
      return nextDayPredictions;
    } else {
      console.log(`No predictions found for the stock ${symbol}.`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching next market day's prediction data:", error);
    return [];
  }
};

export default fetchPredictions;
