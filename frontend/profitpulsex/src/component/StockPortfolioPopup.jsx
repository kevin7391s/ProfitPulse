import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Component for managing users stock portfolio
const StockPortfolioPopup = ({ currentPrices, onClose, refreshData }) => {
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  // State for storing users stock data based on number of shares
  const [stocks, setStocks] = useState({ TSLA: 0, GM: 0, F: 0 });

  // Fetch users data based on userID
  useEffect(() => {
    if (userId) {
      fetchPortfolioData();
    }
  }, [userId]);

  // Fetch users portfolio data from firestore
  const fetchPortfolioData = async () => {
    try {
      const portfolioRef = doc(db, "users", userId, "portfolio", "stocks");
      const docSnap = await getDoc(portfolioRef);
      if (docSnap.exists()) {
        setStocks(docSnap.data());
      }
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
    }
  };

  // manage change in users input fields
  const handleChange = (symbol, value) => {
    setStocks((prev) => ({
      ...prev,
      [symbol]: parseInt(value, 10) || 0,
    }));
  };

  // Saves the users data in firestore
  const handleSave = async () => {
    if (!userId) {
      console.error("User is not authenticated.");
      return;
    }

    try {
      const portfolioRef = doc(db, "users", userId, "portfolio", "stocks");
      await setDoc(portfolioRef, stocks);
      console.log("Portfolio data saved successfully.");

      // Call refreshData to update Dashboard's state after saving
      refreshData();

      onClose();
    } catch (error) {
      console.error("Error saving portfolio data:", error);
      alert("Failed to save portfolio data.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Popup */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-1/3 text-white">
          <h2 className="text-3xl font-bold mb-6 text-lightgreen">
            Manage Your Portfolio
          </h2>
          {["TSLA", "GM", "F"].map((symbol) => (
            <div key={symbol} className="mb-5">
              <label className="block font-semibold mb-2 text-lightgreen">
                {symbol} - Current Price: ${currentPrices[symbol] || "N/A"} USD
              </label>
              <input
                type="number"
                className="bg-gray-800 border border-gray-700 rounded-md p-3 w-full text-white placeholder-gray-500"
                placeholder={`Shares of ${symbol}`}
                value={stocks[symbol] || 0}
                min="0"
                max="500"
                onChange={(e) => handleChange(symbol, e.target.value)}
              />
            </div>
          ))}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-lightgreen text-gray-900 font-bold rounded-md hover:bg-green-400"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockPortfolioPopup;
