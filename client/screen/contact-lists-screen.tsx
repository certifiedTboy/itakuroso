import Notification from "@/components/common/Notification";
import ContactCard from "@/components/contacts/ContactCard";
import SearchInput from "@/components/contacts/SearchInput";
import MenuDropdown from "@/components/dropdown/MenuDropdown";
import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import { ThemedView } from "@/components/ThemedView";
import Icon from "@/components/ui/Icon";
import { loadContacts } from "@/helpers/contact-helpers";
import { getContacts } from "@/helpers/database/contacts";
import { showNotification } from "@/helpers/notification";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DropdownContext } from "@/lib/context/dropdown-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

import { useSelector } from "react-redux";

type ContactListsScreenInterface = {
  navigation: NativeStackNavigationProp<any>;
};

const ContactListsScreen = ({ navigation }: ContactListsScreenInterface) => {
  const [contacts, setContacts] = useState<
    { phoneNumber: string | ""; name: string }[]
  >([]);

  const [filteredContacts, setFilteredContacts] = useState<
    { phoneNumber: string | ""; name: string }[]
  >([]);

  const [contactIsLoading, setContactIsLoading] = useState(false);

  const { currentUser } = useSelector((state: any) => state.authState);

  const [showSearch, setShowSearch] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const dropdownCtx = useContext(DropdownContext);

  const headerTextColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "background"
  );

  /**
   * Handles the search query input
   */
  const onSearchQuery = (text: string) => {
    setSearchQuery(text);
  };

  /**
   * capture users contacts from device
   */
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const contacts = await getContacts();

        // await loadContacts();
        if (!contacts || contacts.length <= 0) {
          await loadContacts();
          const newContacts = await getContacts();
          setContacts(newContacts);
          return;
        }

        setContacts(contacts);
        setFilteredContacts(contacts);
      })();
    }, [])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        setFilteredContacts(
          contacts.filter((contact: any) =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else {
        setFilteredContacts(contacts);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, contacts]);

  /**
   * A function to handle contact update
   */
  const onLoadContacts = async () => {
    setContactIsLoading(true);
    try {
      await loadContacts();
      setContactIsLoading(false);
      // showNotification({
      //   type: "success",
      //   title: "Contacts Loaded",
      //   message: "Your contacts have been successfully loaded.",
      // });

      showNotification({
        type: "success",

        title: "Contacts Loaded",
        message: "Your contacts have been successfully loaded.",

        // onShow: () => {},
        // onHide: () => {},
      });
    } catch (error) {
      setContactIsLoading(false);
      console.error("Error loading contacts:", error);
    }
  };

  /**
   * useEffect to set the header title and options
   * This is used to set the header title and options when the screen is focused
   */
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerTitle: () => (
          <>
            {!showSearch ? (
              <View
                style={{
                  marginLeft: -20,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      color: headerTextColor,
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                  >
                    Select Contacts
                  </Text>
                  <Text style={{ color: headerTextColor, fontSize: 12 }}>
                    {filteredContacts.length}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 20 }}>
                  {contactIsLoading && <LoaderSpinner />}
                  <Icon
                    name="search"
                    size={21}
                    color={headerTextColor}
                    onPress={() => setShowSearch(true)}
                  />

                  <Icon
                    name="ellipsis-vertical"
                    size={21}
                    color={headerTextColor}
                    onPress={() => dropdownCtx.toggleDropdown()}
                  />
                </View>
              </View>
            ) : (
              <SearchInput
                setShowSearch={() => setShowSearch(false)}
                showSearchInput={showSearch}
                onSearchQuery={onSearchQuery}
                searchQuery={searchQuery}
              />
            )}
          </>
        ),
        headerTitleStyle: {
          fontSize: 14,
          fontWeight: "bold",
        },

        headerBackVisible: showSearch ? false : true,
      });
    }, [showSearch, searchQuery, contactIsLoading, filteredContacts.length])
  );

  /**
   * Dropdown options for the contact lists screen
   */
  const options = [
    {
      label: "Settings",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      label: "Help",
      onPress: () => navigation.navigate("Help"),
    },
    {
      label: "Refresh Contacts",
      onPress: () => {
        onLoadContacts();
        dropdownCtx.toggleDropdown();
      },
    },
    {
      label: "Logout",
      onPress: () =>
        showNotification({
          type: "success",
          title: "Logout",
          message: "You have been logged out.",
        }),
    },
  ];

  // Render the card
  // useCallback is used to prevent re-rendering of the card
  const RenderedCard = useCallback(
    ({
      item,
    }: {
      item: {
        phoneNumber: string;
        name: string;
        _id: string;
        members: [{ phoneNumber: string }];
        isActive?: boolean;
        roomId?: string;
      };
    }) => (
      <ContactCard
        contactName={item.name}
        phoneNumber={
          !item?.phoneNumber
            ? item.members.find(
                (c: any) => c?.phoneNumber !== currentUser?.phoneNumber
              )?.phoneNumber || ""
            : item?.phoneNumber
        }
        isActiveUser={item?.isActive}
        contactImage=""
        roomId={item.roomId}
      />
    ),
    []
  );

  return (
    <>
      <View style={{ zIndex: 1000 }}>
        <Notification />
      </View>
      <MenuDropdown options={options} />

      <ThemedView darkColor="#000" lightColor="#fff">
        <View>
          <FlatList
            // @ts-ignore
            data={filteredContacts}
            renderItem={RenderedCard}
            keyExtractor={(item: any) => item.id}
            numColumns={1}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            scrollEventThrottle={10} // Improves performance
            // onEndReached={handleEndReached} // Trigger when reaching the end
          />
        </View>
      </ThemedView>
    </>
  );
};

export default ContactListsScreen;
