import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DropdownContext } from "@/lib/context/dropdown-context";
import React, { useContext, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";

import AIScreen from "@/screen/ai-screen";
import AllChatsScreen from "@/screen/allchats-screen";
import CallsScreen from "@/screen/calls-screen";
import StatusScreen from "@/screen/status-screen";

const renderScene = SceneMap({
  chats: AllChatsScreen,
  status: StatusScreen,
  ai: AIScreen,
  calls: CallsScreen,
});

const MainTabs = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "chats", title: "Itakurọsọ", icon: "chatbubbles-outline" },
    { key: "status", title: "Status", icon: "newspaper-outline" },
    { key: "ai", title: "Itakurọsọ AI", icon: "diamond-outline" },
    { key: "calls", title: "Calls", icon: "call-outline" },
  ]);

  const { toggleDropdown } = useContext(DropdownContext);

  const backgroundColor = useThemeColor(
    { light: Colors.light.bgc, dark: Colors.dark.bgc },
    "background"
  );

  const tintColor = useThemeColor(
    { light: Colors.light.btnBgc, dark: Colors.dark.btnBgc },
    "text"
  );

  const titleColor = useThemeColor(
    { light: Colors.light.btnBgc, dark: Colors.dark.text },
    "text"
  );

  const headerIconColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "text"
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Optional header */}
      <View style={[styles.header, { backgroundColor }]}>
        <Text
          style={[
            routes[index].key === "chats"
              ? styles.mainTitle
              : styles.headerTitle,

            { color: titleColor },
          ]}
        >
          {routes[index].title}
        </Text>
        <Pressable style={{ marginTop: 10 }}>
          <Icon
            name="ellipsis-vertical"
            onPress={toggleDropdown}
            size={25}
            color={headerIconColor}
          />
        </Pressable>
      </View>

      {/* Swipeable content */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
        swipeEnabled
        renderTabBar={() => null} // we use a custom tab bar
      />

      {/* Custom Bottom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor }]}>
        {routes.map((route, idx) => {
          const isFocused = index === idx;
          return (
            <Pressable
              key={route.key}
              style={styles.tabItem}
              onPress={() => setIndex(idx)}
            >
              <Icon
                name={
                  isFocused ? route.icon.replace("-outline", "") : route.icon
                }
                size={30}
                color={isFocused ? tintColor : "#999"}
                onPress={() => setIndex(idx)}
              />
              <Text
                style={{
                  color: isFocused ? tintColor : "#999",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {route.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default MainTabs;

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  mainTitle: {
    fontSize: 30,
    fontWeight: "bold",
  },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});
