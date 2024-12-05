import { db } from "../firebaseConfig";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

export const storePredictions = async(lstm_predicted_price, transformer_predicted_price, predicted_time, predictions_average, daily_average, date, lstm_avg_metrics, transformer_avg_metrics, symbol, last_trained_metrics) =>
{
    try
    {
        // Create reference inside database with \predictions\{symbol}
        const predictionsRef = doc(db, "predictions", symbol);

        const docSnap = await getDoc(predictionsRef);
        let existingPredictions = [];
        let existingDailyAverage = [];
        if (docSnap.exists()) {
            existingPredictions = docSnap.data().predictions || [];
            existingDailyAverage = docSnap.data().daily_average || [];
        }

        // Create array prediction to be stored
        const newPredictions = lstm_predicted_price.map((price, index) => 
            ({
                lstm_predicted_price: price,
                transformer_predicted_price: transformer_predicted_price[index],
                predictions_average: predictions_average[index],
                predicted_time: predicted_time[index],
        }));

        const mergedPredictions = [...existingPredictions];

        // Checking if there is a duplicate replacement time, if so replace it with the new prediction
        newPredictions.forEach(newPrediction => {
            const existingIndex = mergedPredictions.findIndex(prediction => prediction.predicted_time === newPrediction.predicted_time);
            if (existingIndex !== -1)
            {
                mergedPredictions[existingIndex] = newPrediction;
            }
            else
            {
                mergedPredictions.push(newPrediction);
            }
        });

        const new_daily_average = [{daily_average: daily_average, date: date}];
        const mergedDailyAverage = [...existingDailyAverage, ...new_daily_average];
        
        // Update database without overwriting 
        await updateDoc(predictionsRef, {
            predictions: mergedPredictions,
            daily_average: mergedDailyAverage,
            lstm_avg_metrics: lstm_avg_metrics,
            transformer_avg_metrics: transformer_avg_metrics,
            last_trained_metrics: last_trained_metrics,
        });

        console.log("Sucessfully stored!")
    } catch(error)
    {
        console.error("Error storing data : ", error);
        throw error;
    }
}