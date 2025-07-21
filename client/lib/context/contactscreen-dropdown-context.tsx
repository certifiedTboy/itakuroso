import { createContext, useState } from "react";

export const ContactScreenDropdownContext = createContext({
  showDropdown: false,
  showSearchBar: false,
  toggleDropdown: () => {},
  toggleSearchBar: () => {},
  totalContacts: 0,
  contactSearchQuery: "",
  onSearchQuery: (text: string) => {},
  updateTotalContacts: (total: number) => {},
  onContactLoading: (state: boolean) => {},
  contactIsLoading: false,
});

const ContactScreenDropdownProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [contactIsLoading, setContactIsLoading] = useState(false);
  const [totalContacts, setTotalContacts] = useState(0);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  const toggleDropdown = () => {
    return setShowDropdown(!showDropdown);
  };

  const toggleSearchBar = () => {
    return setShowSearchBar(!showSearchBar);
  };

  const onSearchQuery = (text: string) => {
    setContactSearchQuery(text);
  };

  const updateTotalContacts = (total: number) => {
    return setTotalContacts(total);
  };

  const onContactLoading = (state: boolean) => {
    return setContactIsLoading(state);
  };

  const value = {
    showDropdown,
    showSearchBar,
    toggleDropdown,
    totalContacts,
    toggleSearchBar,
    contactSearchQuery,
    onSearchQuery,
    updateTotalContacts,
    onContactLoading,
    contactIsLoading,
  };

  return (
    <ContactScreenDropdownContext.Provider value={value}>
      {children}
    </ContactScreenDropdownContext.Provider>
  );
};

export default ContactScreenDropdownProvider;
