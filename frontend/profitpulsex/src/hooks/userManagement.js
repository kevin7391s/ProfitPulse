import { auth, db } from "../firebaseConfig";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

export const getAllUsers = async () =>
{
    try
    {
        const userCollection = await getDocs(collection(db, "users"));
        const userList = userCollection.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data()
        }));
        const userCount = userList.length;

        return {userList, userCount};
        
    } catch (error)
    {
        console.error("Error fetching users : ", error);
        throw error;
    }
}