import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, View } from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

const Notification = () => {
  const borderColor = useThemeColor(
    { light: Colors.light.btnBgc, dark: Colors.dark.btnBgc },
    "background"
  );

  const backgroundColor = useThemeColor(
    { light: Colors.light.background, dark: Colors.dark.background },
    "background"
  );

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );

  /*
  1. Create the config
*/
  const toastConfig = {
    /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: borderColor,
          width: 200,
          height: 35,
          backgroundColor,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontWeight: "600",
          color: textColor,
        }}
      />
    ),
    /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
    error: (props: any) => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 17,
        }}
        text2Style={{
          fontSize: 15,
        }}
      />
    ),
    /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
    //   tomatoToast: ({ text1, props }: any) => (
    //     <View style={{ height: 10, width: 200, backgroundColor: "#333" }}>
    //       <Text>{text1}</Text>
    //       <Text>{props.uuid}</Text>
    //     </View>
    //   ),
  };

  return (
    <View style={styles.container}>
      <Toast config={toastConfig} />
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
});
