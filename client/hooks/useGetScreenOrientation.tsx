import { useState } from "react";

export const useGetScreenOrientation = () => {
  const [isPortrait, setIsPortrait] = useState(true);

  const getScreenOrientation = (width: number) => {
    if (width <= 770) {
      setIsPortrait(true);
    } else {
      setIsPortrait(false);
    }
  };

  return { isPortrait, getScreenOrientation };
};
