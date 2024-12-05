import React, { useEffect, useState } from "react";
import { getAllUsers } from "../hooks/userManagement";
import { storePredictions } from "../hooks/storeData";
import { fetchPerformanceMetrics } from "../hooks/fetchPerformance";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db, } from "../firebaseConfig";
import MetricsPopup from "../component/MetricsPopup";


// Function to fetch predicted price from Python API that is located in Backend/PredictionModel/predict_model.py and if the fetched response
// is not code 200, it will throw an error stating that it failed. If code 200 is present, it will return the data in JSON format
const fetchPredictedPrice = async (symbol) => {
    const response = await fetch(`/api/predict?symbol=${symbol}`);
    if (!response.ok) {
        throw new Error("Failed to fetch predicted price from API");
    }
    const data = await response.json();
    return data;
};


function AdminDashboard() {
    // Active tab variable that enables rendering between each of the tabs in the dashboard
    const [activeTab, setActiveTab] = useState("users");

    // Performance tab variables, this tab also uses the lastTrained variable within it.
    const [user_count, setUserCount] = useState("");
    const [selectedPerformanceTicker, setSelectedPerformanceTicker] = useState("");
    const [isMetricPopupOpen, setIsMetricPopupOpen] = useState(false);

    // User management tab variables
    const [users, setUsers] = useState([]);
    const [isDeleteAccountOpen, setDeleteAccountOpen] = useState(false);
    const [isResetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortColumn, setSortColumn] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Model tab variables
    const [console_log, setConsoleLog] = useState("")
    const [predicted_symbol, setPredictedSymbol] = useState("")
    const [lstm_predicted_price, setLSTMPredictedPrice] = useState([]);
    const [transformer_predicted_price, setTransformerPredictedPrice] = useState([]);
    const [predictions_average, setPredictionsAverage] = useState([]);
    const [predicted_time, setPredictionTimes] = useState([]);
    const [daily_average, setDailyAverage] = useState("");
    const [date, setDate] = useState("");
    const [error, setError] = useState(null);
    const [lastTrained, setLastTrained] = useState(null);
    const [retrainLoading, setRetrainLoading] = useState(false);
    const [retrainCooldown, setRetrainCooldown] = useState(0);
    const [selectedTicker, setSelectedTicker] = useState("");
    const [lstm_avg_metrics, setLstmAvgMetrics] = useState({});
    const [transformer_avg_metrics, setTransformerAvgMetrics] = useState({});
    const [last_trained_metrics, setLastTrainedMetrics] = useState("");
    const cooldownDuration = 300;
    const [successMessage, setSuccessMessage] = useState("");



    // PERFORMANCE TAB
    // This function will fetch the performance metrics of each model that is obtained from training. The metrics are stored within the database and overwritten
    // each time the models are stored into the database
    const fetchPerformance = async (ticker) => {
        try {
            const { lstm_avg_metrics, transformer_avg_metrics, last_trained_metrics } = await fetchPerformanceMetrics(ticker);
            setLstmAvgMetrics(lstm_avg_metrics);
            setTransformerAvgMetrics(transformer_avg_metrics);
            setLastTrainedMetrics(last_trained_metrics);
        } catch (error) {
            console.error("Error fetching performance metrics:", error);
        }
    };

    // These variables will help determine whether the "Metrics Legend" button is open or not to display the information pop-up or not
    const handleMetricPopupOpen = () => setIsMetricPopupOpen(true);
    const handleMetricPopupClose = () => setIsMetricPopupOpen(false);

    // If the user selects another ticker in the performance metrics drop down menu, it will handle the change of ticker to fetch the rqeuested ticker
    // from the database and also will have error handling within the if statement
    const handleTickerChange = (event) => {
        const ticker = event.target.value;
        setSelectedPerformanceTicker(ticker);
        if (ticker && ticker !== "") {
            fetchPerformance(ticker);
        }
    };

    // This function will help with displaying the metrics in a recursive way as it will call each models performance, if there is no metrics that are shown or listed,
    // it will display 'NA'
    const renderMetrics = (metrics) => {
        return (
            <div className="text-white text-center">
                <p>Average Training Loss: {metrics.avg_train_loss || "NA"}</p>
                <p className="pb-2">Average Validation Loss: {metrics.avg_val_loss|| "NA"}</p>
                <p>Average Training MAE: {metrics.avg_train_mae|| "NA"}</p>
                <p className="pb-2">Average Validation MAE: {metrics.avg_val_mae|| "NA"}</p>
                <p>Average Training RMSE: {metrics.avg_train_rmse|| "NA"}</p>
                <p className="pb-2">Average Validation RMSE: {metrics.avg_val_rmse|| "NA"}</p>
                <p>Average Training R2: {metrics.avg_train_r2|| "NA"}</p>
                <p>Average Validation R2: {metrics.avg_val_r2|| "NA"}</p>
            </div>
        );
    };



    // USER MANAGEMENT TAB
    // Function to call the getAllUsers() function from the userManagement.js file in the hooks folder that will create a variable called
    // userCollection that obtains each users information from its unique userID which also collects the user count with error handling in both
    // the function and hook function
    const fetchUsers = async() => 
    {
    try
    {
        const {userList, userCount} = await getAllUsers();
        setUsers(userList);
        setUserCount(userCount);

    } catch (error)
    {
        console.error("Error fetching users:", error);
    }
    };

    // When admin selects the "User Management" tab, the fetching of users within the database will automatically get requested each time
    useEffect(() => 
        {
          if (activeTab === "users")
          {
            fetchUsers();
          }
        }, [activeTab]
        );

    // This function will open the screen if an admin presses the "Delete Account" button on the tab.
    const toggleDeleteAccount = (user) => {
        console.log("Toggling delete account for user:", user);
        setSelectedUser(user);
        setDeleteAccountOpen(prevState => !prevState);
    };

    // When an admin presses the delete account button confirmation, it will delete the user depending on their userID and will refetch the updated user list
    // and will close the delete account menu. If there is any errors present, it will display in the console
    const deleteUser = async (uid) => {
        try {
            console.log(`Deleting user with UID: ${uid}`);
            await deleteDoc(doc(db, "users", uid));
            fetchUsers();
            setDeleteAccountOpen(false);
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    // Reset password tab toggle
    const toggleResetPassword = (user) => {
        console.log("Resetting password for account: ", user.email)
        setSelectedUser(user);
        setResetPasswordOpen(prevState => !prevState);
    };

    // When an admin presses the reset password button confirmation, it will send a reset password to the selected email that is provide from firebase authentication
    // and will close the reset password menu on reset. If there is any errors present, it will display in the console
    const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log(`Password reset email sent to ${email}`);
        setResetPasswordOpen(false);
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
    };

    // This function will allow the admin the search for any user depending on the first name, last name, and email and will handle it as an event
    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Re-rendering the users list depending on what is typed within the search function and will lower case the search and return the 
    // search that is included within the userlist
    const filteredUsers = users.filter((user) => {
        const firstName = user.firstName ? user.firstName.toLowerCase() : '';
        const lastName = user.lastName ? user.lastName.toLowerCase() : '';
        const email = user.email ? user.email.toLowerCase() : '';
        const query = searchQuery.toLowerCase();
    
        return firstName.includes(query) || lastName.includes(query) || email.includes(query);
    });

    // Handling the sorting when one of the headers are pressed to switch from ascending to descending within each of the headers of First Name, Last Name, and Email
    const handleSort = (column) => {
        let direction = 'asc';
        if (sortColumn === column && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortColumn(column);
        setSortConfig({ key: column, direction });
    };

    // Within the sorting, it will determine what symbol to use whether it is ascending or descending and will display the respective symbol upon pressing any of the 
    // columns in the user list
    const getSortSymbol = (column) => {
    if (sortColumn === column) {
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '';
};

    // Re-rendering the users list when the button is pressed to either sort in ascending or descending order
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const aValue = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : '';
        const bValue = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : '';

        if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });



    // MODEL MANAGEMENT TAB
    // Cooldown timer effect for displaying numbers on how much time in seconds is left within the retrain models button
    useEffect(() => {
        if (retrainCooldown > 0)
        {
            const timer = setTimeout(() => setRetrainCooldown(retrainCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [retrainCooldown]);

    // Has parameter of the ticker that will set the retrain cooldown to the static time, and will call the fetchPredictions function that will fetch call the predictions from
    // the backend with the ticker, if there is any errors that are caught during this time, it will result in returning the error and will turn off the retraining cooldown
    const handleRetrainModels = async (ticker) => 
    {
        if (retrainCooldown > 0 || retrainLoading) return;
        setRetrainLoading(true);
        
        try
        {
            setRetrainCooldown(cooldownDuration);
            await fetchPredictions(ticker);
        } catch(error)
        {
            setError("Error retraining: ", error);
        } finally
        {
            setRetrainLoading(false);
        }
    };

    // This function will fetch the predicted price from the backend prediction model python files that gets the logging information from the training, with setting the
    // prediction prices, averages, times, dates, metrics, and last trained times. If any error occur during the predcition process it will set all the values as null
    const fetchPredictions = async (ticker) => {
        try {
            setPredictedSymbol(ticker);
            const prediction_data = await fetchPredictedPrice(ticker);
            setConsoleLog(prediction_data.console_output);
            setLSTMPredictedPrice(prediction_data.lstm_predicted_price);
            setTransformerPredictedPrice(prediction_data.transformer_predicted_price);
            setPredictionsAverage(prediction_data.predictions_average);
            setPredictionTimes(prediction_data.time);
            setDailyAverage(prediction_data.daily_average);
            setDate(prediction_data.date);
            setLstmAvgMetrics(prediction_data.lstm_avg_metrics);
            setTransformerAvgMetrics(prediction_data.transformer_avg_metrics);
            setLastTrained(new Date().toLocaleString());
            setError(null);
        } catch (err) {
            setError("Failed to fetch stock data.");
            setConsoleLog("");
            setLSTMPredictedPrice([]);
            setTransformerPredictedPrice([]);
            setPredictionsAverage([]);
            setPredictionTimes([]);
            setDailyAverage("");
            setDate("");
            setLstmAvgMetrics({});
            setTransformerAvgMetrics({});
            setLastTrained(new Date().toLocaleString());
        }
    };

    // Use predictions as parameters for storePredictions function in storeData.js hook to input into the Firebase database which will create new entries for each of the models and
    // its respective metrics
    const handleStorePredictions = async () =>
    {
        try
        {
            if (lstm_predicted_price.length > 0 && transformer_predicted_price.length > 0 && predicted_time.length > 0 && predictions_average.length > 0) {

            await storePredictions(lstm_predicted_price, transformer_predicted_price, predicted_time, predictions_average, daily_average, date, lstm_avg_metrics, transformer_avg_metrics ,predicted_symbol, lastTrained);
            console.log("Stored!");

            setSuccessMessage("Successfully stored!");
                setTimeout(() => {setSuccessMessage("")}, 10000);
            }
            else
            {
                console.log("Model not found");
            }
        }catch(error)
        {
            console.error("Error storing predictions: ", error);
        }
    }



    // HTML + CSS code
    return (
        <div className="min-h-screen bg-bgdark p-10 font-body flex justify-center">
            <div className="w-full max-w-5xl bg-gray-800 p-8 rounded-lg border border-lightgreen">
                <div className="mb-8">
                    <h2 className="text-5xl font-heading text-lightgreen flex justify-center pb-2">Admin Dashboard</h2>
                </div>



                {/* ACTIVE TAB BUTTONS */}
                <div className="w-full flex justify-center">
                    <button
                        className={`ml-2 px-4 py-2 rounded hover:bg-green-900 ${activeTab === "users" ? "bg-lightgreen text-black" : "bg-gray-700 text-lightgreen"}`}
                        onClick={() => setActiveTab("users")}
                    >
                        User Management
                    </button>
                    <button
                        className={`ml-2 px-4 py-2 rounded hover:bg-green-900 ${activeTab === "models" ? "bg-lightgreen text-black" : "bg-gray-700 text-lightgreen"}`}
                        onClick={() => setActiveTab("models")}
                    >
                        Model Management
                    </button>
                    <button
                        className={`ml-2 px-4 py-2 rounded hover:bg-green-900 ${activeTab === "performance" ? "bg-lightgreen text-black" : "bg-gray-700 text-lightgreen"}`}
                        onClick={() => setActiveTab("performance")}
                    >
                        Performance
                    </button>
                    <button
                        className={`ml-2 px-4 py-2 rounded hover:bg-green-900 ${activeTab === "logs" ? "bg-lightgreen text-black" : "bg-gray-700 text-lightgreen"}`}
                        onClick={() => setActiveTab("logs")}
                    >
                        Logs
                    </button>
                </div>



                {/* USER MANAGEMENT TAB */}
                {activeTab === "users" && (
                    <div className="flex justify-center mr-auto mt-5 w-full">
                      <div className="w-full">

                        {/* User count displaying */}
                        <div className="text-xl text-lightgreen flex flex-col items-center pb-5">Users Registered: {user_count}</div>

                        {/* Search function that will display on how admin can search for users*/}
                        <div className="pb-4">
                            <input
                                type="text"
                                placeholder="Search by first name, last name, or email"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                className="mb-4 p-2 bg-gray-700 border border-gray-400 rounded w-full text-center"
                            />
                            <p className="flex justify-center text-lightgreen">To sort click First Name, Last Name, or Email</p>
                            <p className="flex justify-center text-lightgreen">Ascending = ▲ | Descending = ▼</p>
                        </div>

                        {/* Table within the user management tab that displays the first name, last name, email, and role. Within each row of the table, it will also have
                            the reset and delete account buttons with its respective function calls. This also handles the button pop-ups when each one is pressed*/}
                        <table className="table-auto w-full text-align:left border-2 border-gray-400">
                            <thead className="text-lightgreen text-left">
                                <tr>
                                    <th className="p-2 cursor-pointer" onClick={() => handleSort("firstName")}>First Name {getSortSymbol("firstName")}</th>
                                    <th className="p-2 cursor-pointer" onClick={() => handleSort("lastName")}>Last Name {getSortSymbol("lastName")}</th>
                                    <th className="p-2 cursor-pointer" onClick={() => handleSort("email")}>Email {getSortSymbol("email")}</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody className="text-left text-white">
                                {sortedUsers.map((user, index) => (
                                    <tr key={user.uid} className="border-2 border-gray-400">
                                        <td className="p-2">{user.firstName || "NA"}</td>
                                        <td className="p-2">{user.lastName || "NA"}</td>
                                        <td className="p-2">{user.email}</td>
                                        <td className="p-2">{user.isAdmin ? 'Admin' : 'User'}</td>
                                        <td className="text-right">
                                            <button className="text-blue-400 bg-gray-700 rounded px-2 hover:bg-green-700"
                                            onClick={() => toggleResetPassword(user)}>Reset Password</button>
                                            {isResetPasswordOpen && selectedUser?.uid === user.uid && (
                                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                                                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-center">
                                                        <h3 className="text-xl font-heading text-white">Are you sure you want to reset user password?</h3>
                                                        <div className="flex justify-around mt-6">
                                                            <button onClick={() => resetPassword(user.email)} className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700">Yes, reset</button>
                                                            <button onClick={toggleResetPassword} className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700">Cancel</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-2 text-right">
                                            <button className="text-red-400 bg-gray-700 rounded px-2 hover:bg-green-700"
                                            onClick={() => toggleDeleteAccount(user)}>Delete Account</button>
                                            {isDeleteAccountOpen && selectedUser?.uid === user.uid && (
                                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                                                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-center">
                                                        <h3 className="text-xl font-heading text-white">Are you sure?</h3>
                                                        <p className="text-gray-400 mt-2">This action is irreversible. Your account will be permanently deleted.</p>
                                                        <div className="flex justify-around mt-6">
                                                            <button onClick={() => deleteUser(user.uid)} className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700">Yes, delete</button>
                                                            <button onClick={toggleDeleteAccount} className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700">Cancel</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                    </div>
                )}



                {/* MODELS TAB */}
                {activeTab === "models" && (
                    <div className="flex flex-col items-center">
                        
                        {/* Sets the ticker variable to what is chosen within the selection drop down menu */}
                        <select value = {selectedTicker} onChange={(e) => setSelectedTicker(e.target.value)} className="w-1/2 mt-8 bg-gray-700 text-lightgreen font-body text-lg px-4 py-2 rounded-lg hover:bg-green-900 text-center">
                            <option value="">Select Ticker</option>
                            <option value="F">Ford</option>
                            <option value="GM">General Motors</option>
                            <option value="TSLA">Telsa</option>
                        </select>

                        {/* When the selected ticker has a value that is valid, it will allow the button to be pressed to call the retrain models function and will display
                            the cool-down timer within the button and not allow it to be clicked until the timer is done */}
                        <button
                            onClick={() => handleRetrainModels(selectedTicker)}
                            className={`w-1/2 mt-8 bg-gray-700 text-lightgreen font-body text-lg py-2 rounded-lg hover:bg-green-900 text-center   
                                ${retrainLoading || retrainCooldown > 0 ? "opacity-50 cursor-not-allowed" : ""}`} disabled={retrainLoading || retrainCooldown > 0}>   
                            {retrainLoading? `Wait ${retrainCooldown}s to retrain`: "Retrain Models"}
                        </button>

                        {/* Displaying of the current time the models were trained and sets the lastTrained model variable */}
                        {lastTrained && (<p className="text-gray-400 mt-2 text-center pb-5">Last trained: {lastTrained}</p>)}
                        {error && <p className="text-red-500">{error}</p>}

                        {/* If any of the models have array length less than 0 it wont show anything and show error within the tab, otherwise
                            it will show the predicted time followed by the price in USD along with the average of both models */}
                        {lstm_predicted_price.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-2xl font-heading text-white text-center">LSTM Predicted Price</h3>
                                {lstm_predicted_price.map((price, index) => (
                                    <p key={index} className="text-gray-400 text-center pt-2 pb-2">
                                        {predicted_time[index]} : ${price.toFixed(2)} USD
                                    </p>
                                ))}
                            </div>
                        )}
                        {transformer_predicted_price.length > 0 && (
                            <div className="mb-10">
                                <h3 className="text-2xl font-heading text-white text-center">Transformer Predicted Price</h3>
                                {transformer_predicted_price.map((price, index) => (
                                    <p key={index} className="text-gray-400 text-center pt-2 pb-2">
                                        {predicted_time[index]} : ${price.toFixed(2)} USD
                                    </p>
                                ))}
                            </div>
                        )}
                        {predictions_average.length > 0 && (
                            <div className="mb-10">
                                <h3 className="text-2xl font-heading text-white text-center">Average Predicted Price</h3>
                                {predictions_average.map((price, index) => (
                                    <p key={index} className="text-gray-400 text-center pt-2 pb-2">
                                        {predicted_time[index]} : ${price.toFixed(2)} USD
                                    </p>
                                ))}
                            </div>
                        )}

                        {successMessage && (
                            <div className="text-green-500 text-center mt-4">
                                {successMessage}
                            </div>
                        )}
                        {/* If all predictions are populated, store models button will show */}
                        {lstm_predicted_price.length > 0 && transformer_predicted_price.length > 0 && predictions_average.length > 0 && (
                            <button className="w-1/2 mt-10 bg-lightgreen font-body text-black text-lg px-6 py-2 rounded-lg hover:bg-green-600" onClick={() => handleStorePredictions()}>Store Models in Database</button>)}
                    </div>
                )}



                {/* PERFORMANCE TAB */}
                {activeTab === "performance" && (
                    <div>
                        <div>
                            {/* Metrics popup button with rendering */}
                            <div className="flex flex-col items-center">
                                <button onClick={handleMetricPopupOpen} className="w-1/2 mt-10 bg-gray-700 text-lightgreen font-body text-lg px-6 py-1.5 rounded-lg hover:bg-green-900 text-center">Metric Legend</button>
                            </div> {isMetricPopupOpen && (<MetricsPopup isOpen={isMetricPopupOpen} onClose={handleMetricPopupClose} />)}
                            
                            {/* Metrics ticker selection*/}
                            <div className="flex flex-col items-center">
                                <select
                                    value={selectedPerformanceTicker}
                                    onChange={handleTickerChange}
                                    className="w-1/2 mt-10 bg-gray-700 text-lightgreen font-body text-lg px-6 py-2 rounded-lg hover:bg-green-900 text-center">
                                    <option value="" className="text-center">Select Ticker To See Metrics</option>
                                    <option value="F" className="text-center">Ford</option>
                                    <option value="GM" className="text-center">General Motors</option>
                                    <option value="TSLA" className="text-center">Telsa</option>
                                </select>
                            </div>

                            {/* Metrics rendering */}
                            <div className="text-xl text-lightgreen flex flex-col items-center pt-10 pb-2">Last Trained: {last_trained_metrics}</div>
                            <div className="text-xl text-lightgreen flex flex-col items-center pt-10 pb-2">LSTM Average Metrics</div>
                            <div>{renderMetrics(lstm_avg_metrics)}</div>
                            <div className="text-xl text-lightgreen flex flex-col items-center pt-10 pb-2">Transformer Average Metrics</div>
                            <div>{renderMetrics(transformer_avg_metrics)}</div>
                        </div>
                    </div>
                )}

                

                {/* LOGS TAB */}
                {activeTab === "logs" && (
                    <div>
                        {/* If log length is 0 it will show logs within a box that will wrap, and if log length is 0, will display No Logs Available */}
                        {console_log.length > 0 &&(<pre className="text-white bg-gray-900 p-4 rounded whitespace-pre-wrap overflow-auto"> {console_log} </pre>)}
                        {console_log.length === 0 &&(<div className="text-xl text-lightgreen flex flex-col items-center pt-10 pb-2">No Logs Available</div>)}
                    </div>
                )}
            </div>
        </div>
    );
}
export default AdminDashboard;