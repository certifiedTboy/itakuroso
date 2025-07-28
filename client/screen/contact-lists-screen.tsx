import Notification from "@/components/common/Notification";
import ContactCard from "@/components/contacts/ContactCard";
import ContactScreenDropdown from "@/components/dropdown/ContactScreenDropdown";
import { ThemedView } from "@/components/ThemedView";
import { loadContacts } from "@/helpers/contact-helpers";
import { getContacts } from "@/helpers/database/contacts";
import { showNotification } from "@/helpers/notification";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ContactScreenDropdownContext } from "@/lib/context/contactscreen-dropdown-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const {
    updateTotalContacts,
    contactSearchQuery,
    toggleDropdown,
    onContactLoading,
  } = useContext(ContactScreenDropdownContext);

  const { currentUser } = useSelector((state: any) => state.authState);

  const safeAreaBackground = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  /**
   * capture users contacts from device
   */
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const contacts = await getContacts();

        // await loadContacts();
        if (!contacts || contacts.length <= 0) {
          onContactLoading(true);
          await loadContacts();
          const newContacts = await getContacts();
          setContacts(newContacts);
          return onContactLoading(false);
        }

        setContacts(contacts);
        setFilteredContacts(contacts);
      })();
    }, [])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (contactSearchQuery.trim().length > 0) {
        setFilteredContacts(
          contacts.filter(
            (contact: any) =>
              contact.name
                .toLowerCase()
                .includes(contactSearchQuery.toLowerCase()) ||
              contact.phoneNumber.includes(contactSearchQuery)
          )
        );
      } else {
        setFilteredContacts(contacts);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [contactSearchQuery, contacts]);

  /**
   * A function to handle contact update
   */
  const onLoadContacts = async () => {
    onContactLoading(true);
    try {
      await loadContacts();
      onContactLoading(false);
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
      onContactLoading(false);
      console.error("Error loading contacts:", error);
    }
  };

  /**
   * useEffect to set the header title and options
   * This is used to set the header title and options when the screen is focused
   */
  useFocusEffect(
    useCallback(() => {
      updateTotalContacts(filteredContacts.length);
    }, [contactSearchQuery, filteredContacts.length])
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
        toggleDropdown();
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
        phoneNumber={item?.phoneNumber}
        isActiveUser={!!item?.roomId}
        contactImage=""
        roomId={item?.roomId}
      />
    ),
    []
  );

  function moveToTop(
    arr: { phoneNumber: string }[],
    criteria: (item: any) => boolean
  ) {
    return [
      ...arr.filter(
        (item) =>
          criteria(item) && item?.phoneNumber !== currentUser?.phoneNumber
      ),
      ...arr.filter((item) => !criteria(item)),
    ];
  }

  return (
    <SafeAreaView
      style={[{ backgroundColor: safeAreaBackground }, styles.container]}
      edges={["bottom", "left", "right"]}
    >
      <View style={{ zIndex: 1000 }}>
        <Notification />
      </View>
      <ContactScreenDropdown options={options} />

      <ThemedView darkColor="#000" lightColor="#fff">
        <FlatList
          // @ts-ignore
          data={moveToTop(filteredContacts, (item: any) => item.roomId)}
          renderItem={RenderedCard}
          keyExtractor={(item: any) => item.id}
          numColumns={1}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          scrollEventThrottle={10} // Improves performance
          windowSize={10} // Adjust based on your needs
          onEndReachedThreshold={0.5} // Adjust sensitivity
          getItemLayout={(data, index) => ({
            length: 60,
            offset: 60 * index,
            index,
          })}
        />
      </ThemedView>
    </SafeAreaView>
  );
};

export default ContactListsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
