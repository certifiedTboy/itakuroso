import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const useKeyboard = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const closeKeyboard = () => {
    Keyboard.dismiss();
  };

  const updateKeyboardHeight = (height: number) => {
    setKeyboardHeight(height);
  };

  return {
    keyboardVisible,
    closeKeyboard,
    keyboardHeight,
    updateKeyboardHeight,
  };
};
