import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DropdownContext } from "@/lib/context/dropdown-context";
import AIScreen from "@/screen/ai-screen";
import AllChatsScreen from "@/screen/allchats-screen";
import CallsScreen from "@/screen/calls-screen";
import StatusScreen from "@/screen/status-screen";
import React, { useContext, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SceneMap, TabView } from "react-native-tab-view";

const MainTabs = () => {
  const [index, setIndex] = useState(0);

  const renderScene = SceneMap({
    chats: AllChatsScreen,
    status: StatusScreen,
    ai: AIScreen,
    calls: CallsScreen,
  });

  const [routes] = useState([
    { key: "chats", title: "Itakurọsọ", icon: "chatbubbles-outline" },
    { key: "status", title: "Status", icon: "newspaper-outline" },
    { key: "ai", title: "Itakurọsọ AI", icon: "diamond-outline" },
    { key: "calls", title: "Calls", icon: "call-outline" },
  ]);

  const { toggleDropdown } = useContext(DropdownContext);

  const safeAreaBackground = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );

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

  const shadowStyle = {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
    }),
  };

  return (
    <SafeAreaView
      style={[{ backgroundColor: safeAreaBackground }, styles.container]}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={{ flex: 1 }}>
        {/* Optional header */}
        <View style={[styles.header, { backgroundColor, ...shadowStyle }]}>
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
    </SafeAreaView>
  );
};

export default MainTabs;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
