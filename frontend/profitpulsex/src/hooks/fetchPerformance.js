import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const fetchPerformanceMetrics = async (ticker) => {
    try {
        const docRef = doc(db, "predictions", ticker);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const lstm_avg_metrics = data.lstm_avg_metrics || {};
            const transformer_avg_metrics = data.transformer_avg_metrics || {};
            const last_trained_metrics = data.last_trained_metrics || "";
            return { lstm_avg_metrics, transformer_avg_metrics, last_trained_metrics };
        } else {
            throw new Error("No such document!");
        }
    } catch (error) {
        console.error("Error fetching performance metrics:", error);
        throw error;
    }
};