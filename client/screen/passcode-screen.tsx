import ErrorModal from "@/components/modals/ErrorModal";
import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { validatePasscodeForm } from "@/helpers/form-validation";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useUpdatePasscodeMutation } from "@/lib/apis/userApis";
import { AuthContext } from "@/lib/context/auth-context";
import { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
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
const PasscodeSchema = validatePasscodeForm();

const PasscodeScreen = ({ route }: VerificationScreenProps) => {
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

  const authCtx = useContext(AuthContext);

  const [updatePasscode, { isSuccess, data, error, isError, isLoading }] =
    useUpdatePasscodeMutation();

  useEffect(() => {
    if (isSuccess) {
      authCtx.authenticate(data?.data?.authToken);
    }

    if (isError) {
      setShowModalError(true);
    }
  }, [isError, isSuccess]);

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

            <ThemedText style={styles.introText}>Choose a passcode</ThemedText>
          </View>

          <View style={styles.descTextContainer}>
            <ThemedText style={styles.descText}>
              Choose a passcode that you will remember to secure your account
            </ThemedText>
          </View>

          <View style={styles.inputContainer}>
            <OtpInput
              numberOfDigits={6}
              onTextChange={handleChange("passcode")}
              onBlur={() => handleBlur("passcode")}
              theme={{
                pinCodeTextStyle: styles.pinCodeText,
              }}
            />
            {errors?.passcode && (
              <ThemedText style={styles.errorText}>
                {errors.passcode}
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
                  <ThemedText>Continue</ThemedText>
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
              See DevTee!
            </ThemedText>
          </View>
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
