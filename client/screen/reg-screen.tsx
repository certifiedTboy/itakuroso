import ErrorModal from "@/components/modals/ErrorModal";
import ThemedButton from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { formValidation } from "@/helpers/form-validation";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCreateNewUserMutation } from "@/lib/apis/userApis";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Image, StyleSheet, TextInput, View } from "react-native";

/**
 * type definition for the RegScreen component
 */
type RegScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

/**
 * yup validation schema for the registration form
 */
const SignupSchema = formValidation();

const RegScreen = ({ navigation }: RegScreenProps) => {
  const [showModalError, setShowModalError] = useState(false);

  const [createNewUser, { isSuccess, error, isError }] =
    useCreateNewUserMutation();

  /**
   * useThemeColor hook to define placeholder color for the input fields
   */
  const placeholderColor = useThemeColor(
    { light: "#000", dark: "#fff" },
    "background"
  );

  useEffect(() => {
    if (isSuccess) {
      navigation.navigate("verification-screen");
    }

    if (isError) {
      setShowModalError(true);
    }
  }, [isSuccess, isError]);

  return (
    <Formik
      initialValues={{ email: "", phoneNumber: "" }}
      onSubmit={(values) => console.log(values)}
      validationSchema={SignupSchema}
    >
      {({ handleChange, handleBlur, values, errors }) => (
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
            <ThemedText style={styles.inputLabel}>Phone Number:</ThemedText>
            <TextInput
              style={[styles.input, { color: placeholderColor }]}
              autoCapitalize="none"
              placeholderTextColor={placeholderColor}
              keyboardType="number-pad"
              onBlur={handleBlur("phoneNumber")}
              onChangeText={handleChange("phoneNumber")}
              value={values.phoneNumber}
            />
            {errors?.phoneNumber && (
              <ThemedText style={styles.errorText}>
                {errors.phoneNumber}
              </ThemedText>
            )}

            <ThemedText style={[styles.inputLabel, { marginTop: 20 }]}>
              Email:
            </ThemedText>
            <TextInput
              style={[styles.input, { color: placeholderColor }]}
              autoCapitalize="none"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              onBlur={handleBlur("email")}
              onChangeText={handleChange("email")}
              value={values.email}
            />
            {errors?.email && (
              <ThemedText style={styles.errorText}>{errors?.email}</ThemedText>
            )}

            <View style={styles.btnContainer}>
              <ThemedButton
                onPress={async () =>
                  await createNewUser({
                    phoneNumber: values.phoneNumber,
                    email: values.email,
                  })
                }
                darkBackground={Colors.dark.btnBgc}
                lightBackground={Colors.light.btnBgc}
              >
                <ThemedText>Next</ThemedText>
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
    marginBottom: 5,
  },
});
