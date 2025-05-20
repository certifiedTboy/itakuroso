import MenuDropdown from "@/components/dropdown/MenuDropdown";

const AllChatsScreen = ({ navigation }: { navigation: any }) => {
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
      label: "Logout",
      onPress: () => console.log("Logout pressed"),
    },
  ];
  return (
    // <ThemedView>
    <MenuDropdown options={options} />
    // </ThemedView>
  );
};

export default AllChatsScreen;
