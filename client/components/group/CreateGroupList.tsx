import { useCallback } from "react";
import { FlatList } from "react-native";
import { ThemedView } from "../ThemedView";
import CreateGroupCard from "./CreateGroupCard";

const CreateGroupList = ({
  groupContacts,
  removeContact,
}: {
  groupContacts: { phoneNumber: string; name: string; profileImage: string }[];
  removeContact: (phoneNumber: string) => void;
}) => {
  const renderItem = useCallback(
    ({
      item,
    }: {
      item: { phoneNumber: string; name: string; profileImage: string };
    }) => (
      <CreateGroupCard
        contactName={item.name}
        phoneNumber={item.phoneNumber}
        onPress={removeContact}
        profileImage={item.profileImage}
      />
    ),
    []
  );

  return (
    <ThemedView darkColor="#000" lightColor="#fff">
      <FlatList
        style={{ paddingHorizontal: 10 }}
        data={groupContacts}
        renderItem={renderItem}
        horizontal={true}
        keyExtractor={(item) =>
          item.phoneNumber + Math.floor(Math.random() * 1000).toString()
        }
        showsHorizontalScrollIndicator={false}
      />
    </ThemedView>
  );
};

export default CreateGroupList;
