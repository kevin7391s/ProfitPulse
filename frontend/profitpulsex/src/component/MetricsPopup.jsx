import React from 'react';

const MetricsPopup = ({ isOpen, onClose }) => {
    if (!isOpen) 
        return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-gray-400 p-6 rounded-lg shadow-lg w-1/2">
                <h2 className="text-2xl font-bold mb-4 flex justify-center">Metric Information</h2>
                <ul className="list-disc list-inside">
                    <li>Loss: The numerical metric that quantifies the difference between a model’s predictions and the actual target values. The lower the value the more accurate.<br /><br /></li>
                    <li>MAE (Mean Absolute Error) : The measure of the average difference between predicted values and actual values.<br /><br /></li>
                    <li>RMSE (Root Mean Squared Error) : The measure of the average magnitude of the differences between predicted values and actual values in the training dataset.<br /><br /></li>
                    <li>R2 : The proportion of the variance in the dependent variable that is explained by the independent variables. In other words, it assesses how well the model fits the training data.<br /><br /></li>
                </ul>
                <div className='flex justify-center'><button
                    onClick={onClose}
                    className="mt-4 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-900 ">
                    Close
                </button></div>
            </div>
        </div>
    );
};

export default MetricsPopup;