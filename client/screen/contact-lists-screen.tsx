import ContactCard from "@/components/contacts/ContactCard";
import SearchInput from "@/components/contacts/SearchInput";
import { ThemedView } from "@/components/ThemedView";
import Icon from "@/components/ui/Icon";
import { insertContacts } from "@/helpers/database/contacts";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

type ContactListsScreenInterface = {
  navigation: NativeStackNavigationProp<any>;
};

const ContactListsScreen = ({ navigation }: ContactListsScreenInterface) => {
  const [contacts, setContacts] = useState<
    { phoneNumber: string | ""; name: string }[]
  >([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const headerTextColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "background"
  );

  const onSearchQuery = (text: string) => {
    setSearchQuery(text);
  };

  /**
   * capture users contacts
   */
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        await Contacts.requestPermissionsAsync();
      }

      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({});

        console.table(data);

        if (data.length > 0) {
          const contacts = data
            .map((contact) => {
              const number =
                contact.phoneNumbers && contact.phoneNumbers.length > 0
                  ? contact.phoneNumbers[0].number
                  : "";

              const name = contact.name;
              const id = contact.id;

              return {
                phoneNumber: number ?? "",
                name: name ?? "",
                id: id ?? "",
              };
            })
            .filter((contact) => contact.phoneNumber !== "")
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
          setContacts(contacts);
          await insertContacts(contacts);
        }
      }
    })();
  }, []);

  useEffect(() => {
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
                  {contacts.length}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 20 }}>
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
                  onPress={() => navigation.goBack()}
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
  });

  // Render the card
  // useCallback is used to prevent re-rendering of the card
  const RenderedCard = useCallback(
    ({ item }: { item: { phoneNumber: string; name: string } }) => (
      <ContactCard
        contactName={item.name}
        phoneNumber={item.phoneNumber}
        isActiveUser={true}
        contactImage={require("../assets/images/avatar.png")}
      />
    ),
    []
  );

  return (
    <ThemedView darkColor="#000" lightColor="#fff">
      <View>
        <FlatList
          data={contacts}
          renderItem={RenderedCard}
          keyExtractor={(item: any) => item.id}
          numColumns={1}
          scrollEventThrottle={16} // Improves performance
          // onEndReached={handleEndReached} // Trigger when reaching the end
          onEndReachedThreshold={0.5} // Adjust sensitivity
        />
      </View>
    </ThemedView>
  );
};

export default ContactListsScreen;
