import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useStockData from "../hooks/useStockData";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Chart component to display stock and prediction prices
const Chart = ({ symbol }) => {
  // retreive stock data from imported useStockDat
  const { stockData, weeklyPredictedData, loading, error } =
    useStockData(symbol);

  // Chart options for styling and config
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "line",
          color: "#ffffff",
          font: { size: 20 },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(2, 2, 2, 0.2)" },
        ticks: {
          color: "#ffffff",
          font: { size: 14 },
        },
      },
      y: {
        grid: { color: "rgba(2, 2, 2, 0.2)" },
        ticks: {
          color: "#ffffff",
          font: { size: 14 },
        },
      },
    },
  };

  // Convert date to mm-dd-yyyy
  const formatDate = (dateString) => {
    const d = new Date(`${dateString}T00:00:00`);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Sort dates from stock and prediciton database
  const databaseDates = [
    ...new Set([
      ...stockData.map((data) => data.date),
      ...weeklyPredictedData.map((data) => data.date),
    ]),
  ].sort((a, b) => new Date(a) - new Date(b));

  // Grab last 7 days for chart
  const last7Dates = databaseDates.slice(-7);

  // Map actual and prediction prices to their dates
  const actualPrices = last7Dates.map((date) => {
    const data = stockData.find((d) => d.date === date);
    return data ? parseFloat(data.close) : null;
  });

  const predictedPrices = last7Dates.map((date) => {
    const data = weeklyPredictedData.find((d) => d.date === date);
    return data ? parseFloat(data.close) : null;
  });

  // Format labels to mm-dd-yyyy
  const labels = last7Dates.map((date) => formatDate(date));

  const data = {
    labels,
    datasets: [
      {
        label: "Actual Stock Prices",
        data: actualPrices,
        borderColor: "#20d919",
        backgroundColor: "rgba(32, 217, 25, 0.2)",
        tension: 0.3,
        fill: false,
        borderWidth: 4,
      },
      {
        label: "Predicted Prices",
        data: predictedPrices,
        borderColor: "#f24444",
        backgroundColor: "rgba(242, 68, 68, 0.2)",
        borderDash: [5, 5],
        tension: 0.3,
        fill: false,
        borderWidth: 4,
      },
    ],
  };

  return (
    <div className="h-[85%] w-[80%] mx-auto">
      {/* Chart title */}
      <h2 className="text-2xl font-bold mb-4">
        {symbol}'s Daily Market Prices
      </h2>
      {loading && <p>Loading stock data...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {/* Render chart if data is available */}
      {!loading && !error && stockData.length > 0 && (
        <Line options={options} data={data} />
      )}
    </div>
  );
};

export default Chart;
