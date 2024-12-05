import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioPieChart = ({ data, prices }) => {
  // create company-specific colors
  const companyColors = {
    TSLA: "#cc0000",
    GM: "#0054a4",
    F: "#003e74",
  };

  // Calculate the total values for each stock
  const portfolioValues = Object.keys(data).map((symbol) => {
    const shares = data[symbol] || 0;
    const price = prices[symbol] || 0;
    return shares * price;
  });

  // Filter out stocks with no value
  const filteredSymbols = Object.keys(data).filter(
    (symbol) => data[symbol] > 0
  );
  const filteredValues = portfolioValues.filter((value) => value > 0);

  // Map the filtered symbols to their respective colors
  const filteredColors = filteredSymbols.map(
    (symbol) => companyColors[symbol] || "#cccccc"
  );

  // Colors, chart values, labels
  const chartData = {
    labels: filteredSymbols,
    datasets: [
      {
        data: filteredValues,
        backgroundColor: filteredColors,
        hoverBackgroundColor: filteredColors.map((color) => color + "B3"),
        borderColor: "#0b1726",
        borderWidth: 2,
        hoverOffset: 20,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: "#c4e2f2",
          font: { size: 14 },
        },
      },
      tooltip: {
        backgroundColor: "#2e4159",
        bodyColor: "#c4e2f2",
      },
    },
    cutout: "10%",
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
  };

  // Add shadow effect to mimic 3D
  const canvasStyle = {
    boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.5)",
    borderRadius: "15px",
  };

  return (
    <div style={canvasStyle}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PortfolioPieChart;
