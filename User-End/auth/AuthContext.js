import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Children, createContext, useEffect, useState } from "react";

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [userID, setUserID] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const isLoggedIn = async () => {
    try {
      const userToken = await AsyncStorage.getItem("token");
      setToken(userToken);
    } catch (error) {
      console.error("error", error);
    }
  };

  const updateToken = async (newToken) => {
    try {
      await AsyncStorage.setItem("token", newToken);
      setToken(newToken);
      
      // Refresh user data from the new token
      if (newToken) {
        try {
          const decodedToken = jwtDecode(newToken);
          const userID = decodedToken.userID;
          const userImage = decodedToken.image;
          const userEmail = decodedToken.email;
          const userFirstName = decodedToken.firstName;
          const userLastName = decodedToken.lastName;
          
          setUserImage(userImage);
          setUserID(userID);
          setUserEmail(userEmail);
          setUserName(
            userLastName ? userFirstName + " " + userLastName : userFirstName
          );
        } catch (error) {
          console.error("Error decoding new token:", error);
        }
      }
    } catch (error) {
      console.error("Error updating token:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const userID = decodedToken.userID;
          const userImage = decodedToken.image;
          const userEmail = decodedToken.email;
          const userFirstName = decodedToken.firstName;
          const userLastName = decodedToken.lastName;
          console.log(decodedToken);
          setUserImage(userImage);
          setUserID(userID);
          setUserEmail(userEmail);
          setUserName(
            userLastName ? userFirstName + " " + userLastName : userFirstName
          );
          console.log(userName);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    isLoggedIn();
  }, []);
  
  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        updateToken,
        userID,
        setUserID,
        userImage,
        setUserImage,
        userEmail,
        setUserEmail,
        userName,
        setUserName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export { AuthContext, AuthProvider };
