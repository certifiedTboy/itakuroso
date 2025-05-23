import ErrorModal from "@/components/modals/ErrorModal";
import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { validateVerificationform } from "@/helpers/form-validation";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useVerifyUserAccountMutation } from "@/lib/apis/userApis";
import { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Image, Linking, StyleSheet, View } from "react-native";
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
  const [showModalError, setShowModalError] = useState(false);

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

  useEffect(() => {
    if (isSuccess) {
      if (data?.message === "verification code updated") {
        return;
      } else {
        navigation.navigate("passcode-screen", { email: route.params?.email });
      }
    }

    if (isError) {
      setShowModalError(true);
    }
  }, [isSuccess, isError, data]);

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
          {showModalError && (
            <ErrorModal
              errorMessage={
                error && "data" in error && (error as any).data?.message
                  ? (error as any).data.message
                  : "Something went wrong"
              }
              modalVisible={showModalError}
              setModalVisible={setShowModalError}
            />
          )}

          <View style={styles.textContainer}>
            <Image
              source={require("../assets/images/chat-bubble.png")}
              style={styles.bubbleImage}
            />

            <ThemedText style={styles.introText}>
              Verify your account
            </ThemedText>
          </View>

          <View style={styles.descTextContainer}>
            {data && data?.message === `verification code updated` ? (
              <ThemedText style={styles.descText}>
                A new code has been sent to {route.params?.email} to verify your
                account
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
              }}
            />
            {errors?.verificationCode && (
              <ThemedText style={styles.errorText}>
                {errors.verificationCode}
              </ThemedText>
            )}

            <View style={styles.btnContainer}>
              <ThemedButton
                onPress={() =>
                  verifyUserAccountHandler({ isValid, value: values })
                }
                darkBackground={Colors.dark.btnBgc}
                lightBackground={Colors.light.btnBgc}
              >
                {!isLoading ? (
                  <ThemedText>Verify</ThemedText>
                ) : (
                  <LoaderSpinner color="#fff" />
                )}
              </ThemedButton>
            </View>
          </View>

          <View style={styles.footerTextContainer}>
            <ThemedText
              style={{
                textAlign: "center",
                marginTop: 20,
                fontSize: 15,
                color: textColor,
              }}
              onPress={() => openWebsite()}
            >
              See who created me!
            </ThemedText>
          </View>
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
    width: "60%",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 50,
    marginHorizontal: "auto",
  },

  bubbleImage: {
    width: 50,
    height: 200,
    resizeMode: "contain",
    marginBottom: 15,
  },

  introText: {
    fontSize: 19,
    fontWeight: "600",
    textAlign: "center",
    marginTop: -80,
  },

  descTextContainer: {
    width: "80%",
    marginHorizontal: "auto",
    marginTop: 10,
  },

  descText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },

  inputContainer: {
    width: "80%",
    marginHorizontal: "auto",
    marginTop: 50,
  },
  pinCodeText: { color: "#0263FFFF" },
  input: {
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },

  inputLabel: { marginBottom: -10 },

  btnContainer: {
    width: 100,
    marginHorizontal: "auto",
    marginTop: 100,
  },

  errorText: {
    color: Colors.light.errorText,
    fontSize: 12,
    marginVertical: 5,
  },

  footerTextContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 30,
  },
});
