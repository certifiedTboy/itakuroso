import { DropdownContext } from "@/lib/context/dropdown-context";
import React, { useContext, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MenuDropdownOption = {
  label: string;
  onPress: () => void;
};

type MenuDropdownProps = {
  options: MenuDropdownOption[];
};

const MenuDropdown: React.FC<MenuDropdownProps> = ({ options }) => {
  // const [visible, setVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const { dropdownIsVisible, toggleDropdown } = useContext(DropdownContext);

  const onSelect = (option: any) => {
    setSelectedOption(option);
    // setVisible(false);
    option.onPress(); // Execute the associated action
  };

  return (
    <View style={styles.container}>
      <Modal
        transparent={true}
        visible={dropdownIsVisible}
        onRequestClose={() => toggleDropdown()}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => toggleDropdown()}
        >
          <View style={styles.dropdown}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => onSelect(option)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1,
  },
  button: {
    padding: 10,
  },
  overlay: {
    flex: 1,
    alignItems: "flex-end",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 55,
    marginRight: 8,
  },
  option: {
    padding: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
  },
});

export default MenuDropdown;
