import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ContactScreenDropdownContext } from "@/lib/context/contactscreen-dropdown-context";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MenuDropdownOption = {
  label: string;
  onPress: () => void;
};

type MenuDropdownProps = {
  options: MenuDropdownOption[];
};

const ContactScreenDropdown: React.FC<MenuDropdownProps> = ({ options }) => {
  // const [visible, setVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const { showDropdown, toggleDropdown } = useContext(
    ContactScreenDropdownContext
  );

  const cardBg = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );

  const slideAnim = useRef(new Animated.Value(-200)).current; // Start off-screen

  useEffect(() => {
    if (showDropdown) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide down to visible
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -200, // Slide back up
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showDropdown]);

  const onSelect = (option: any) => {
    setSelectedOption(option);
    // setVisible(false);
    option.onPress(); // Execute the associated action
  };

  return (
    <View style={styles.container}>
      <Modal
        transparent={true}
        visible={showDropdown}
        onRequestClose={() => toggleDropdown()}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => toggleDropdown()}
        >
          <Animated.View
            style={[
              styles.dropdown,
              { transform: [{ translateY: slideAnim }] },
              { backgroundColor: cardBg },
            ]}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => onSelect(option)}
              >
                <Text style={[styles.optionText, { color: textColor }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ContactScreenDropdown;

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
    fontFamily: "RobotoMedium",
    fontWeight: "500",
  },
});
