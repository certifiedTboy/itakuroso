// import ThemedButton from "@/components/ThemedButton";
// import { ThemedText } from "@/components/ThemedText";
// import { ThemedView } from "@/components/ThemedView";
// import { Colors } from "@/constants/Colors";
// import { StyleSheet, View } from "react-native";

// const VerificationScreen = () => {
//   return (
//     <ThemedView
//       style={styles.mainContainer}
//       darkColor={Colors.dark.bgc}
//       lightColor={Colors.light.bgc}
//     >
//       <View style={styles.inputContainer}>
//         <ThemedText>Verification Screen</ThemedText>
//         <OtpInput
//           numberOfDigits={6}
//           onTextChange={(text) => console.log(text)}
//         />
//       </View>

//       <View style={styles.btnContainer}>
//         <ThemedButton
//           style={styles.btn}
//           darkBackground={Colors.dark.btnBgc}
//           lightBackground={Colors.light.btnBgc}
//         >
//           <ThemedText>Verify</ThemedText>
//         </ThemedButton>
//       </View>
//     </ThemedView>
//   );
// };

// export default VerificationScreen;

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     // justifyContent: "center",
//     marginTop: 90,
//     alignItems: "center",
//   },

//   inputContainer: {
//     width: "80%",
//     marginHorizontal: "auto",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   btnContainer: {
//     marginTop: 20,
//     width: 100,
//   },

//   btn: {
//     width: 100,
//   },

//   // filledPinCodeContainer: {
//   //   margin: 15,
//   // },
// });

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
const VerificationSchema = validateVerificationform();

const VerificationScreen = ({ navigation, route }: VerificationScreenProps) => {
  const [showModalError, setShowModalError] = useState(false);

  const [verifyUserAccount, { isSuccess, error, isError, isLoading }] =
    useVerifyUserAccountMutation();

  /**
   * useThemeColor hook to define placeholder color for the input fields
   */
  const placeholderColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "background"
  );

  useEffect(() => {
    if (isSuccess) {
      console.log("Verification successful");
      navigation.navigate("main-tabs");
    }

    if (isError) {
      setShowModalError(true);
    }
  }, [isSuccess, isError]);

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
            <ThemedText style={styles.descText}>
              A code has been sent to {route.params?.email} and{" "}
              {route.params?.phoneNumber}
            </ThemedText>
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
