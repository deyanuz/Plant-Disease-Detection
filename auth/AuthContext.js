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

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
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
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    isLoggedIn();
  }, [token]);
  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
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
