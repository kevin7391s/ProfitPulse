import React from "react";

// Data modal used for displayin prediction prices in modal
const dataModal = ({ isOpen, onClose, data, stockSymbol }) => {
  if (!isOpen) return null;

  // function to convert datae into correct format
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { formattedDate, formattedTime };
  };

  // extract date of first element in data set to display
  const displayDate =
    data.length > 0
      ? formatDateTime(data[0].predicted_time).formattedDate
      : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 relative w-3/4 max-w-2xl z-[10000] text-white">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-lightgreen hover:text-green-400 text-3xl"
        >
          &times;
        </button>
        {/* Modal title */}
        <h2 className="font-heading text-2xl mb-6 text-lightgreen">
          Current Market Day Predicted Prices for {stockSymbol}
        </h2>
        {/* Display the date of the predictions */}
        <h3 className="font-body text-lg mb-4 text-gray-300">
          Date: {displayDate}
        </h3>
        {/* Scrollable content area for predictions */}
        <div className="overflow-y-auto max-h-[70vh]">
          {data && data.length > 0 ? (
            <ul className="font-body text-lg space-y-4">
              {data.map((prediction, index) => {
                const { formattedTime } = formatDateTime(
                  prediction.predicted_time
                );
                return (
                  <li
                    key={index}
                    className="bg-gray-800 p-4 rounded-lg shadow-md"
                  >
                    <p className="text-lightgreen font-semibold">
                      Time: {formattedTime}
                    </p>
                    <p>
                      LSTM Predicted Price:{" "}
                      <span className="text-white">
                        $
                        {parseFloat(prediction.lstm_predicted_price).toFixed(2)}{" "}
                        USD
                      </span>
                    </p>
                    <p>
                      Transformer Predicted Price:{" "}
                      <span className="text-white">
                        $
                        {parseFloat(
                          prediction.transformer_predicted_price
                        ).toFixed(2)}{" "}
                        USD
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-400">
              No predictions available for the next market day.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default dataModal;
