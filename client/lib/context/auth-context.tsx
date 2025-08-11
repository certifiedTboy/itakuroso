import { dropDatabase } from "@/helpers/database/drop-database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState } from "react";
import { useGetCurrentUserMutation } from "../apis/userApis";

type AuthContextType = {
  isAuthenticated: boolean;
  authenticate: (accessToken: string, refreshToken: string) => void;
  checkUserIsAuthenticated: () => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  authenticate: (accessToken: string, refreshToken: string) => {},
  checkUserIsAuthenticated: () => {},
  logout: () => {},
});

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [getCurrentUser] = useGetCurrentUserMutation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  /**
   * Function to authenticate the user and set the authentication state
   * @param accessToken - The authentication token to be stored
   * @param refreshToken - The refresh token to be stored
   */
  const authenticate = async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
    setIsAuthenticated(true);
  };

  /**
   * Function to log out the user and clear the authentication state
   * It also clears the token from AsyncStorage
   */
  const logout = async () => {
    await dropDatabase();
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
  };

  /**
   * Function to check if the user is authenticated
   * It retrieves the token from AsyncStorage and updates the authentication state accordingly
   */
  const checkUserIsAuthenticated = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");

    if (!accessToken) {
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
