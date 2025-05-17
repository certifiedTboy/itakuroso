import { Colors } from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import Modal from "react-native-modal";
import ThemedButton from "../ThemedButton";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

/**
 * type definition for the ErrorModal component
 */
type ErrorModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  errorMessage: string;
};

const ErrorModal = ({
  modalVisible,
  setModalVisible,
  errorMessage,
}: ErrorModalProps) => {
  return (
    <View>
      <ThemedView style={styles.centeredView}>
        <Modal
          animationIn="slideInUp"
          animationOut="slideOutDown"
          hasBackdrop={true}
          backdropColor="black"
          backdropOpacity={0.7}
          isVisible={modalVisible}
          onBackButtonPress={() => setModalVisible(!modalVisible)}
          onBackdropPress={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <ThemedText
                lightColor={Colors.light.errorText}
                darkColor={Colors.dark.errorText}
                style={styles.modalText}
              >
                {errorMessage}
              </ThemedText>
              <ThemedButton
                darkBackground={Colors.dark.btnBgc}
                lightBackground={Colors.light.btnBgc}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <ThemedText>Try Again!</ThemedText>
              </ThemedButton>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </View>
  );
};

export default ErrorModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },

  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
