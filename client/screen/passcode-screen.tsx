import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { validatePasscodeForm } from "@/helpers/form-validation";
import { useGetScreenOrientation } from "@/hooks/useGetScreenOrientation";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  useRequestPasscodeResetMutation,
  useUpdatePasscodeMutation,
} from "@/lib/apis/userApis";
import { AuthContext } from "@/lib/context/auth-context";
import { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useContext, useEffect } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { OtpInput } from "react-native-otp-entry";

export type RootStackParamList = {
  Reg: { userId: string }; // example route and params
  Home: undefined;
};

/**
 * type definition for the VerificationScreen component
 */
type VerificationScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, any>;
};

/**
 * yup validation schema for the registration form
 */
const PasscodeSchema = validatePasscodeForm();

const PasscodeScreen = ({ route }: VerificationScreenProps) => {
  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );

  const { width } = useWindowDimensions();

  const { isPortrait, getScreenOrientation } = useGetScreenOrientation();

  const openWebsite = async () => {
    const url = "https://www.linkedin.com/in/emmanuel-tosin-817257149";
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      // console.log(`Don't know how to open this URL: ${url}`);
    }
  };

  const authCtx = useContext(AuthContext);

  const [updatePasscode, { isSuccess, data, error, isError, isLoading }] =
    useUpdatePasscodeMutation();

  const [requestPasscodeReset, { isLoading: requestPasscodeResetLoading }] =
    useRequestPasscodeResetMutation();

  // console.log("login data", data?.data);

  useEffect(() => {
    if (isSuccess) {
      authCtx.authenticate(data?.data?.accessToken, data?.data?.refreshToken);
    }

    getScreenOrientation(width);
  }, [isSuccess, width]);

  const verifyUserAccountHandler = async (values: {
    isValid: boolean;
    value: { passcode: string };
  }) => {
    const { passcode } = values.value;

    if (!passcode || !values.isValid) return;

    await updatePasscode({
      passcode,
      email: route.params?.email,
    });
  };

  return (
    <Formik
      initialValues={{ passcode: "" }}
      onSubmit={(values) => console.log(values)}
      validationSchema={PasscodeSchema}
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
                { width: isPortrait ? width * 0.7 : width * 0.4 },
              ]}
            >
              <ThemedText style={styles.descText}>
                Choose a passcode to secure your account
              </ThemedText>
            </View>

            <View style={styles.inputContainer}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={handleChange("passcode")}
                onBlur={() => handleBlur("passcode")}
                theme={{
                  pinCodeTextStyle: styles.pinCodeText,
                  filledPinCodeContainerStyle: styles.input,
                  containerStyle: {
                    ...styles.inputContainer,
                    width: isPortrait ? width * 0.8 : width * 0.6,
                  },
                }}
                textInputProps={{
                  accessibilityLabel: "One-Time Passcode Input",
                }}
              />

              <View style={styles.errorTextContainer}>
                {errors?.passcode && (
                  <>
                    <Icon
                      name="alert-circle"
                      size={16}
                      color={Colors.light.errorText}
                    />
                    <ThemedText style={styles.errorText}>
                      {errors.passcode}
                    </ThemedText>
                  </>
                )}
              </View>
              <View
                style={[
                  styles.btnContainer,
                  { width: isPortrait ? width * 0.8 : width * 0.6 },
                ]}
              >
                <ThemedButton
                  onPress={() =>
                    verifyUserAccountHandler({ isValid, value: values })
                  }
                  darkBackground={Colors.dark.btnBgc}
                  lightBackground={Colors.light.btnBgc}
                >
                  {!isLoading ? (
                    <ThemedText style={styles.btnText}>Continue</ThemedText>
                  ) : (
                    <LoaderSpinner color="#fff" />
                  )}
                </ThemedButton>

                <View style={styles.infoTextContainer}>
                  <View style={styles.errorTextContainer}>
                    {isError && (
                      <>
                        <Icon
                          name="alert-circle"
                          size={16}
                          color={Colors.light.errorText}
                        />
                        <ThemedText style={styles.errorText}>
                          {error &&
                          "data" in error &&
                          (error as any).data?.message
                            ? (error as any).data.message
                            : "Something went wrong"}
                        </ThemedText>
                      </>
                    )}
                  </View>

                  <View style={styles.timerContainer}>
                    {requestPasscodeResetLoading && (
                      <LoaderSpinner size="small" />
                    )}
                    <ThemedButton
                      darkBackground="transparent"
                      lightBackground="transparent"
                      onPress={() => {
                        // if (countdownTimeLeft === 60) {
                        // startCountdown();
                        requestPasscodeReset({
                          email: route.params?.email,
                        });
                        // }
                      }}
                    >
                      <ThemedText
                        darkColor={Colors.dark.text}
                        lightColor={Colors.light.text}
                        style={styles.resendBtnText}
                      >
                        Reset Passcode
                      </ThemedText>
                    </ThemedButton>
                  </View>
                </View>
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
                See DevTee!
              </ThemedText>
            </View>
          </ScrollView>
        </ThemedView>
      )}
    </Formik>
  );
};

export default PasscodeScreen;

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

  introText: {
    fontSize: 19,
    fontWeight: "600",
    textAlign: "center",
    marginTop: -80,
  },

  descTextContainer: {
    marginHorizontal: "auto",
    marginTop: -60,
  },

  descText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },

  btnText: {
    fontWeight: "condensedBold",
    fontSize: 17,
    fontFamily: "robotoMedium",
  },

  inputContainer: {
    marginHorizontal: "auto",
    marginTop: 30,
  },
  pinCodeText: { color: "#0263FFFF" },
  input: {},

  inputLabel: { marginBottom: -10 },

  btnContainer: {
    marginHorizontal: "auto",
    marginTop: 15,
  },

  errorTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  errorText: {
    color: Colors.light.errorText,
    fontSize: 12,
    marginVertical: 5,
    fontFamily: "robotoMedium",
  },

  resendBtnText: {
    fontSize: 15,
    fontFamily: "robotoMedium",
    alignSelf: "flex-end",
    marginLeft: -10,
    marginRight: -13,
  },

  infoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -10,
  },

  timerContainer: { flexDirection: "row", alignItems: "center" },

  footerTextContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 30,
  },
});
