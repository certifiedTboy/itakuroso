import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Icon from "@/components/ui/Icon";
import { Colors } from "@/constants/Colors";
import { validateVerificationform } from "@/helpers/form-validation";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTimeCountdown } from "@/hooks/useTimeCountdown";
import {
  useGetNewVerificationCodeMutation,
  useVerifyUserAccountMutation,
} from "@/lib/apis/userApis";
import { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useEffect } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { useGetScreenOrientation } from "@/hooks/useGetScreenOrientation";

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
const VerificationSchema = validateVerificationform();

const VerificationScreen = ({ navigation, route }: VerificationScreenProps) => {
  const { width } = useWindowDimensions();

  const { isPortrait, getScreenOrientation } = useGetScreenOrientation();

  const { countdownTimeLeft, startCountdown } = useTimeCountdown();

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );

  const openWebsite = async () => {
    const url = "https://www.linkedin.com/in/emmanuel-tosin-817257149";
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      // console.log(`Don't know how to open this URL: ${url}`);
    }
  };

  const [verifyUserAccount, { isSuccess, data, error, isError, isLoading }] =
    useVerifyUserAccountMutation();

  const [getNewVerificationCode, { isLoading: newVerificationCodeLoading }] =
    useGetNewVerificationCodeMutation();

  useEffect(() => {
    if (isSuccess) {
      if (data?.message === "verification code updated") {
        return;
      } else {
        navigation.navigate("passcode-screen", { email: route.params?.email });
      }
    }

    /**
     * get screen orienttion if its portrait or landscape
     */
    getScreenOrientation(width);
  }, [isSuccess, data, width]);

  const verifyUserAccountHandler = async (values: {
    isValid: boolean;
    value: { verificationCode: string };
  }) => {
    const { verificationCode } = values.value;

    if (!verificationCode || !values.isValid) return;

    await verifyUserAccount({
      verificationCode,
    });
  };

  return (
    <Formik
      initialValues={{ verificationCode: "" }}
      onSubmit={(values) => console.log(values)}
      validationSchema={VerificationSchema}
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
              {data && data?.message === `verification code updated` ? (
                <ThemedText style={styles.descText}>
                  A new code has been sent to {route.params?.email} to verify
                  your account
                </ThemedText>
              ) : (
                <ThemedText style={styles.descText}>
                  A code has been sent to {route.params?.email} and{" "}
                  {route.params?.phoneNumber}
                </ThemedText>
              )}
            </View>

            <View style={styles.inputContainer}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={handleChange("verificationCode")}
                onBlur={() => handleBlur("verificationCode")}
                theme={{
                  pinCodeTextStyle: styles.pinCodeText,
                  filledPinCodeContainerStyle: styles.input,
                  containerStyle: {
                    ...styles.inputContainer,
                    width: isPortrait ? width * 0.8 : width * 0.6,
                  },
                }}
                textInputProps={{
                  accessibilityLabel: "One-Time Password",
                }}
              />
              <View style={styles.resendBtnContainer}>
                <View style={styles.errorTextContainer}>
                  {errors?.verificationCode && (
                    <>
                      <Icon
                        name="alert-circle"
                        size={16}
                        color={Colors.light.errorText}
                      />
                      <ThemedText style={styles.errorText}>
                        {errors.verificationCode}
                      </ThemedText>
                    </>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {newVerificationCodeLoading && <LoaderSpinner size="small" />}
                  <ThemedButton
                    darkBackground="transparent"
                    lightBackground="transparent"
                    onPress={() => {
                      if (countdownTimeLeft === 60) {
                        startCountdown();
                        getNewVerificationCode({
                          email: route.params?.email,
                          phoneNumber: route.params?.phoneNumber,
                        });
                      }
                    }}
                  >
                    <ThemedText
                      darkColor={Colors.dark.text}
                      lightColor={Colors.light.text}
                      style={styles.resendBtnText}
                    >
                      Resend Code
                    </ThemedText>
                  </ThemedButton>
                </View>
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
                    <ThemedText style={styles.btnText}>Verify</ThemedText>
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
                    <ThemedText style={styles.timerText}>
                      {countdownTimeLeft > 0 &&
                        `Resend code in ${
                          countdownTimeLeft === 60 ? 0 : countdownTimeLeft
                        } seconds`}
                    </ThemedText>
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
                See who created me!
              </ThemedText>
            </View>
          </ScrollView>
        </ThemedView>
      )}
    </Formik>
  );
};

export default VerificationScreen;

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

  inputContainer: {
    marginHorizontal: "auto",
    marginTop: 30,
  },
  pinCodeText: { color: "#0263FFFF" },
  input: {},

  inputLabel: { marginBottom: -10 },

  btnContainer: {
    marginHorizontal: "auto",
  },

  btnText: {
    fontWeight: "condensedBold",
    fontSize: 17,
    fontFamily: "robotoMedium",
  },

  resendBtnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -15,
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
    marginTop: -2,
  },

  errorTextContainer: { flexDirection: "row", alignItems: "center" },

  errorText: {
    color: Colors.light.errorText,
    fontSize: 12,
    marginVertical: 5,
    fontFamily: "robotoMedium",
  },

  timerContainer: { flexDirection: "row", alignItems: "center" },

  timerText: {
    fontSize: 12,
    color: Colors.light.btnBgc,
    marginLeft: 5,
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
