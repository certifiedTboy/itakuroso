import ErrorModal from "@/components/modals/ErrorModal";
import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { validatePasscodeForm } from "@/helpers/form-validation";
import { useUpdatePasscodeMutation } from "@/lib/apis/userApis";
import { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
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

const PasscodeScreen = ({ navigation, route }: VerificationScreenProps) => {
  const [showModalError, setShowModalError] = useState(false);

  const [updatePasscode, { isSuccess, error, isError, isLoading }] =
    useUpdatePasscodeMutation();

  useEffect(() => {
    if (isSuccess) {
      navigation.navigate("main-tabs");
    }

    if (isError) {
      setShowModalError(true);
    }
  }, [isSuccess, isError]);

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
    width: "10%",
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
});
