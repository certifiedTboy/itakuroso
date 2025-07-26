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

  const authenticate = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // await dropDatabase();
    await AsyncStorage.removeItem("token");
    setIsAuthenticated(false);
  };

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
