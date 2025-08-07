import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { validateRegform } from "@/helpers/form-validation";
import { useGetScreenOrientation } from "@/hooks/useGetScreenOrientation";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCreateNewUserMutation } from "@/lib/apis/userApis";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useEffect } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { TextInput } from "react-native-paper";

/**
 * type definition for the RegScreen component
 */
type RegScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

/**
 * yup validation schema for the registration form
 */
const SignupSchema = validateRegform();

const openWebsite = async () => {
  const url = "https://www.linkedin.com/in/emmanuel-tosin-817257149";
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  } else {
    // console.log(`Don't know how to open this URL: ${url}`);
  }
};

const RegScreen = ({ navigation }: RegScreenProps) => {
  const { width } = useWindowDimensions();

  const { isPortrait, getScreenOrientation } = useGetScreenOrientation();

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );

  const [createNewUser, { data, isSuccess, error, isError, isLoading }] =
    useCreateNewUserMutation();

  /**
   * useColorScheme hook to get the current color scheme of the device
   */
  const theme = useColorScheme();

  /**
   * useThemeColor hook to define placeholder color for the input fields
   */
  const placeholderColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "background"
  );

  useEffect(() => {
    if (isSuccess) {
      navigation.navigate("verification-screen", {
        email: data?.data?.email,
        phoneNumber: data?.data?.phoneNumber,
      });
    }

    /**
     * get screen orienttion if its portrait or landscape
     */
    getScreenOrientation(width);
  }, [isSuccess, width]);

  const createNewUserHandler = async (values: {
    isValid: boolean;
    value: { email: string; phoneNumber: string };
  }) => {
    const { email, phoneNumber } = values.value;

    if (!email || !phoneNumber || !values.isValid) return;

    await createNewUser({
      email,
      phoneNumber,
    });
  };

  return (
    <Formik
      initialValues={{ email: "", phoneNumber: "" }}
      onSubmit={(values) => console.log(values)}
      validationSchema={SignupSchema}
    >
      {({ handleChange, values, errors, handleBlur, isValid }) => (
        <ThemedView
          darkColor={Colors.dark.bgc}
          lightColor={Colors.light.bgc}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.textContainer, { width: width * 0.1 }]}>
              <Image
                source={require("../assets/images/chat-bubble.png")}
                style={styles.bubbleImage}
              />
            </View>

            <View
              style={[
                styles.descTextContainer,
                { width: isPortrait ? width * 0.6 : width * 0.4 },
              ]}
            >
              <ThemedText style={styles.descText}>
                Itakurọsọ needs to verify your Phone number and email
              </ThemedText>
            </View>

            <View
              style={[
                styles.inputContainer,
                { width: isPortrait ? width * 0.8 : width * 0.6 },
              ]}
            >
              <TextInput
                style={[styles.input, { color: placeholderColor }]}
                autoCapitalize="none"
                keyboardType="number-pad"
                onBlur={handleBlur("phoneNumber")}
                onChangeText={handleChange("phoneNumber")}
                value={values.phoneNumber}
                label={"Phone Number"}
                mode={theme === "dark" ? "flat" : "outlined"}
              />
              {errors?.phoneNumber && (
                <View style={styles.errorTextContainer}>
                  <Icon
                    name="alert-circle"
                    size={16}
                    color={Colors.light.errorText}
                  />
                  <ThemedText style={styles.errorText}>
                    {errors.phoneNumber}
                  </ThemedText>
                </View>
              )}

              <TextInput
                style={[styles.input, { color: placeholderColor }]}
                autoCapitalize="none"
                placeholderTextColor={placeholderColor}
                keyboardType="email-address"
                onBlur={handleBlur("email")}
                onChangeText={handleChange("email")}
                value={values.email}
                label={"Email"}
                mode={theme === "dark" ? "flat" : "outlined"}
              />
              {errors?.email && (
                <View style={styles.errorTextContainer}>
                  <Icon
                    name="alert-circle"
                    size={16}
                    color={Colors.light.errorText}
                  />
                  <ThemedText style={styles.errorText}>
                    {errors.email}
                  </ThemedText>
                </View>
              )}

              <View
                style={[
                  styles.btnContainer,
                  { width: isPortrait ? width * 0.8 : width * 0.6 },
                ]}
              >
                <ThemedButton
                  onPress={() =>
                    createNewUserHandler({ isValid, value: values })
                  }
                  darkBackground={Colors.dark.btnBgc}
                  lightBackground={Colors.light.btnBgc}
                >
                  {!isLoading ? (
                    <ThemedText style={styles.btnText}>Next</ThemedText>
                  ) : (
                    <LoaderSpinner color="#fff" />
                  )}
                </ThemedButton>

                {isError && (
                  <View style={styles.errorTextContainer}>
                    <Icon
                      name="alert-circle"
                      size={16}
                      color={Colors.light.errorText}
                    />
                    <ThemedText style={styles.errorText}>
                      {error && "data" in error && (error as any).data?.message
                        ? (error as any).data.message
                        : "Something went wrong"}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.footerTextContainer}>
              <ThemedText
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  fontSize: 15,
                  color: textColor,
                  fontFamily: "robotoMedium",
                }}
                onPress={() => openWebsite()}
              >
                See who created me!
              </ThemedText>
            </View>
          </ScrollView>
        </ThemedView>
      )}
    </Formik>
  );
};

export default RegScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  textContainer: {
    alignItems: "center",
    marginHorizontal: "auto",
  },

  bubbleImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },

  descTextContainer: {
    marginHorizontal: "auto",
    marginTop: -60,
  },

  errorTextContainer: { flexDirection: "row", alignItems: "center" },

  descText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    fontFamily: "robotoMedium",
  },

  inputContainer: {
    marginHorizontal: "auto",
    marginTop: 30,
  },

  input: {
    height: 45,
    marginTop: 10,
    fontFamily: "robotoMedium",
    fontSize: 16,
  },

  inputLabel: { marginBottom: -10 },

  btnContainer: {
    marginHorizontal: "auto",
    marginTop: 25,
  },

  btnText: {
    fontWeight: "condensedBold",
    fontSize: 17,
    fontFamily: "robotoMedium",
  },

  errorText: {
    color: Colors.light.errorText,
    fontSize: 12,
    fontFamily: "robotoMedium",
  },

  footerTextContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 30,
  },
});
