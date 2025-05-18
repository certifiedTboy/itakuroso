import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import AIScreen from "@/screen/ai-screen";
import AllChatsScreen from "@/screen/allchats-screen";
import CallsScreen from "@/screen/calls-screen";
import StatusScreen from "@/screen/status-screen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const backgroundColor = useThemeColor(
    { light: Colors.light.bgc, dark: Colors.dark.bgc },
    "background"
  );

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Chats") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Status") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "Calls") {
            iconName = focused ? "call" : "call-outline";
          } else {
            iconName = focused ? "diamond" : "diamond-outline";
          }

          return (
            <Icon
              name={iconName}
              size={30}
              color={color}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        },

        headerStyle: {
          backgroundColor: backgroundColor,
        },
        headerStatusBarHeight: 1,
        tabBarStyle: {
          height: 70,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 5,
        },

        tabBarLabelStyle: {
          fontWeight: "bold",
          fontSize: 15,
          marginTop: 6,
        },
      })}
    >
      <Tab.Screen
        name="Chats"
        options={{
          headerTitle: "Itakurọsọ",

          headerTitleStyle: {
            fontSize: 30,
            fontWeight: "bold",
          },
        }}
        component={AllChatsScreen}
      />

      <Tab.Screen
        name="Status"
        options={{
          headerTitle: "Status",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
        component={StatusScreen}
      />

      <Tab.Screen
        name="AI"
        options={{
          headerTitle: "Itakurọsọ-AI",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
        component={AIScreen}
      />

      <Tab.Screen
        name="Calls"
        options={{
          headerTitle: "Calls",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
        component={CallsScreen}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
