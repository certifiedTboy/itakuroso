import CreateGroupList from "@/components/group/CreateGroupList";
import GroupContactCard from "@/components/group/GroupContactCard";
import { ThemedView } from "@/components/ThemedView";
import FloatingBtn from "@/components/ui/FloatingBtn";
import { getContactsWithRoomIds, IContact } from "@/helpers/database/contacts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const NewGroupScreen = () => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [groupContacts, setGroupContacts] = useState<
    { id: string; phoneNumber: string; name: string; profileImage: string }[]
  >([]);

  const { currentUser } = useSelector((state: any) => state.authState);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      if (currentUser) {
        const data = await getContactsWithRoomIds();

        setContacts(
          data.filter(
            (contact) => contact.phoneNumber !== currentUser.phoneNumber
          )
        );
      }
    })();
  }, []);

  const safeAreaBackground = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

  /**
   * @function addContactToGroupList
   * @description Adds a contact to the group list to be created.
   * @param phoneNumber - The phone number of the contact to add.
   * @param name - The name of the contact to add.
   * @param profileImage - The profile image of the contact to add.
   */
  const addContactToGroupList = (
    phoneNumber: string,
    name: string,
    profileImage: string,
    id: string
  ) => {
    setGroupContacts((prev) => {
      if (prev.some((c) => c.phoneNumber === phoneNumber)) {
        return prev;
      }
      return [...prev, { phoneNumber, name, profileImage, id }];
    });
  };

  const removeContactFromGroupList = (phoneNumber: string) => {
    setGroupContacts((prev) =>
      prev.filter((c) => c.phoneNumber !== phoneNumber)
    );
  };

  const RenderedCard = useCallback(
    ({
      item,
    }: {
      item: {
        phoneNumber: string;
        name: string;
        id: string;
        roomId?: string;
      };
    }) => (
      <GroupContactCard
        contactName={item.name[0].toUpperCase() + item.name.slice(1)}
        phoneNumber={item?.phoneNumber}
        contactImage=""
        onPress={addContactToGroupList}
      />
    ),
    []
  );

  return (
    <SafeAreaView
      style={[{ backgroundColor: safeAreaBackground }, styles.container]}
      edges={["left", "right"]}
    >
      <ThemedView darkColor="#000" lightColor="#fff" style={{ flex: 1 }}>
        {groupContacts && groupContacts.length > 0 && (
          <CreateGroupList
            groupContacts={groupContacts}
            removeContact={removeContactFromGroupList}
          />
        )}

        <FloatingBtn
          onNavigate={() =>
            // @ts-ignore
            navigation.navigate("new-group-details-screen", { groupContacts })
          }
          iconName="arrow-right-circle"
          style={styles.floatingBtn}
        />
        <FlatList
          data={contacts}
          renderItem={RenderedCard}
          keyExtractor={(item) => item.id}
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

export default NewGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  floatingBtn: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 50,
    zIndex: 100,
  },
});
