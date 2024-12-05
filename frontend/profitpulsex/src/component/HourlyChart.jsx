import React, { useState, useEffect } from "react";
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
import useSpecificStockData from "../hooks/useHalfHourlyData";

// Register Chart.js Components for rendering charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HourlyChart = ({ symbol }) => {
  // Grab data form useSpecificStockData hook
  const { specificTimesStockData, predictedHourlyData, loading, error } =
    useSpecificStockData(symbol);

  // state variables
  const [chartData, setChartData] = useState(null);
  const [chartLabels, setChartLabels] = useState(null);
  const [chartDate, setChartDate] = useState(null);

  // Update chart when new data is fetched
  useEffect(() => {
    if (!loading && !error && specificTimesStockData.length > 0) {
      const reversedData = [...specificTimesStockData].reverse();

      // reverse data to display in correct order
      const labels = reversedData.map((data) =>
        new Date(data.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      // map actual stock prices
      const stockPrices = reversedData.map((data) => data.close);

      // map prediction prices
      const predictionsAverage = reversedData.map((data) => {
        const match = predictedHourlyData.find(
          (prediction) => prediction.time === data.time
        );
        return match ? match.average : null;
      });

      const lstmPredictions = reversedData.map((data) => {
        const match = predictedHourlyData.find(
          (prediction) => prediction.time === data.time
        );
        return match ? match.lstm : null;
      });

      const transformerPredictions = reversedData.map((data) => {
        const match = predictedHourlyData.find(
          (prediction) => prediction.time === data.time
        );
        return match ? match.transformer : null;
      });

      const displayDate = new Date(
        specificTimesStockData[0].time
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // update state with chart labels and data
      setChartLabels(labels);
      setChartData({
        labels,
        datasets: [
          {
            label: "Actual Stock Prices",
            data: stockPrices,
            borderColor: "#20d919",
            backgroundColor: "rgba(32, 217, 25, 0.2)",
            tension: 0.3,
            fill: false,
            borderWidth: 4,
          },
          {
            label: "Predictions (Average)",
            data: predictionsAverage,
            borderColor: "#f24444",
            backgroundColor: "rgba(242, 68, 68, 0.2)",
            borderDash: [5, 5],
            tension: 0.3,
            fill: false,
            borderWidth: 4,
          },
          {
            label: "LSTM Predictions",
            data: lstmPredictions,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderDash: [2, 2],
            tension: 0.3,
            fill: false,
            borderWidth: 4,
          },
          {
            label: "Transformer Predictions",
            data: transformerPredictions,
            borderColor: "rgba(153, 102, 255, 1)",
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            borderDash: [8, 4],
            tension: 0.3,
            fill: false,
            borderWidth: 4,
          },
        ],
      });
      setChartDate(displayDate);
    }
  }, [specificTimesStockData, predictedHourlyData, loading, error]);

  // Chart.js config options
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
        ticks: { color: "#ffffff", font: { size: 14 } },
      },
      y: {
        grid: { color: "rgba(2, 2, 2, 0.2)" },
        ticks: { color: "#ffffff", font: { size: 14 } },
      },
    },
  };

  return (
    <div className="h-[80%] w-[80%] mx-auto">
      {/* Chart title */}
      <h2 className="text-2xl font-bold mb-4">{symbol} Hourly Data</h2>
      {/* Display the selected date */}
      <p className="text-lg mb-4">Date: {chartDate || "Loading..."}</p>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-lg"></p>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {/* Render the chart if data is available */}
        {chartData && <Line options={options} data={chartData} />}
      </div>
    </div>
  );
};

export default HourlyChart;
