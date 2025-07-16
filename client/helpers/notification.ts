import Toast from "react-native-toast-message";

export const showNotification = ({
  type,
  title,
  message,
}: {
  type: string;
  title: string;
  message: string;
}) => {
  Toast.show({
    type: type,
    position: "top",
    text1: title,
    text2: "",
    visibilityTime: 1700,
    autoHide: true,
    topOffset: 20,
    bottomOffset: 100,

    // onShow: () => {},
    // onHide: () => {},
  });
};
