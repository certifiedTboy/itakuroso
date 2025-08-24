import { useCallback } from "react";
import { FlatList } from "react-native";
import GroupDetailsCard from "./GroupDetailsCard";

const GroupDetailsContactList = ({
  groupContacts,
}: {
  groupContacts: { phoneNumber: string; name: string; profileImage: string }[];
}) => {
  const renderItem = useCallback(
    ({
      item,
    }: {
      item: { phoneNumber: string; name: string; profileImage: string };
    }) => (
      <GroupDetailsCard
        contactName={item.name}
        phoneNumber={item.phoneNumber}
        profileImage={item.profileImage}
      />
    ),
    []
  );

  return (
    <FlatList
      style={{ paddingHorizontal: 10 }}
      data={groupContacts}
      renderItem={renderItem}
      numColumns={5}
      keyExtractor={(item) =>
        item.phoneNumber + Math.floor(Math.random() * 1000).toString()
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default GroupDetailsContactList;
