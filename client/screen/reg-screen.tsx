import ErrorModal from "@/components/modals/ErrorModal";
import LoaderSpinner from "@/components/spinner/LoaderSpinner";
import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { validateRegform } from "@/helpers/form-validation";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCreateNewUserMutation } from "@/lib/apis/userApis";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View, useColorScheme } from "react-native";
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

const RegScreen = ({ navigation }: RegScreenProps) => {
  const [showModalError, setShowModalError] = useState(false);

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

    if (isError) {
      setShowModalError(true);
    }
  }, [isSuccess, isError]);

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
              Enter you phone number and email
            </ThemedText>
          </View>

          <View style={styles.descTextContainer}>
            <ThemedText style={styles.descText}>
              Itakuroso will need to verify your phone number and email
            </ThemedText>
          </View>

          <View style={styles.inputContainer}>
            {/* <ThemedText style={styles.inputLabel}>Phone Number:</ThemedText> */}
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
              <ThemedText style={styles.errorText}>
                {errors.phoneNumber}
              </ThemedText>
            )}

            {/* <ThemedText style={[styles.inputLabel, { marginTop: 20 }]}>
              Email:
            </ThemedText> */}
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
              <ThemedText style={styles.errorText}>{errors?.email}</ThemedText>
            )}

            <View style={styles.btnContainer}>
              <ThemedButton
                onPress={() => createNewUserHandler({ isValid, value: values })}
                darkBackground={Colors.dark.btnBgc}
                lightBackground={Colors.light.btnBgc}
              >
                {!isLoading ? (
                  <ThemedText>Next</ThemedText>
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

export default RegScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  textContainer: {
    width: "60%",
    alignItems: "center",
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
    marginTop: -20,
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

  input: {
    height: 50,
    // borderColor: "#333",
    // borderWidth: 1,
    marginTop: 20,
    // paddingHorizontal: 10,
    // borderRadius: 10,
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
    marginBottom: 5,
  },
});
