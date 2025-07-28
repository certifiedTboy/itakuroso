import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState } from "react";
import { useGetCurrentUserMutation } from "../apis/userApis";

type AuthContextType = {
  isAuthenticated: boolean;
  authenticate: (token: string) => void;
  checkUserIsAuthenticated: () => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  authenticate: (token: string) => {},
  checkUserIsAuthenticated: () => {},
  logout: () => {},
});

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [getCurrentUser] = useGetCurrentUserMutation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  /**
   * Function to authenticate the user and set the authentication state
   * @param token - The authentication token to be stored
   */
  const authenticate = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  /**
   * Function to log out the user and clear the authentication state
   * It also clears the token from AsyncStorage
   */
  const logout = async () => {
    // await dropDatabase();
    await AsyncStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  /**
   * Function to check if the user is authenticated
   * It retrieves the token from AsyncStorage and updates the authentication state accordingly
   */
  const checkUserIsAuthenticated = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      return setIsAuthenticated(false);
    }

    getCurrentUser(null);
    setIsAuthenticated(true);
  };

  const value = {
    checkUserIsAuthenticated,
    isAuthenticated,
    authenticate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
