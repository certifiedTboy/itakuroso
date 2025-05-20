import { createContext, ReactNode, useState } from "react";

/**
 * DropdownContext
 * This context is used to manage the visibility of a dropdown menu.
 * It provides a state variable `dropdownIsVisible` to indicate whether the dropdown is visible or not,
 * and a function `toggleDropdown` to toggle its visibility.
 */
export const DropdownContext = createContext({
  dropdownIsVisible: false,
  toggleDropdown: () => {},
});

/**
 * DropdownContextProvider
 * This component provides the DropdownContext to its children.
 * It manages the state of the dropdown visibility and provides a function to toggle it.
 * @param {ReactNode} children - The children components that will have access to the DropdownContext.
 */
const DropdownContextProvider = ({ children }: { children: ReactNode }) => {
  const [dropdownIsVisible, setDropdownIsVisible] = useState(false);

  /**
   * toggleDropdown
   * This function toggles the visibility of the dropdown menu.
   * If the dropdown is currently visible, it sets it to not visible, and vice versa.
   * It is used to show or hide the dropdown menu when the user interacts with it.
   */
  const toggleDropdown = () => {
    return setDropdownIsVisible(!dropdownIsVisible);
  };

  /**
   * DropdownContext value
   * This object contains the state variable `dropdownIsVisible` and the function `toggleDropdown`.
   * It is passed to the DropdownContext.Provider to make it available to all child components.
   * The `dropdownIsVisible` variable indicates whether the dropdown menu is currently visible or not.
   * The `toggleDropdown` function is used to toggle the visibility of the dropdown menu.
   */
  const value = {
    dropdownIsVisible,
    toggleDropdown,
  };

  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
};

export default DropdownContextProvider;
