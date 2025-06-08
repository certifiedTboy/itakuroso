import { Image, View } from "react-native";
import Icon from "../ui/Icon";

import Modal from "react-native-modal";

type ImagePreviewModalProps = {
  isVisible: boolean;
  onClose: () => void;
  imageUrl: string;
};

const ImagePreviewModal = ({
  isVisible,
  onClose,
  imageUrl,
}: ImagePreviewModalProps) => {
  return (
    <View style={{ flex: 1 }}>
      <Modal
        isVisible={isVisible}
        avoidKeyboard={true}
        coverScreen={true}
        backdropOpacity={0.92}
        onBackButtonPress={() => onClose()}
      >
        <View style={{ flex: 1 }}>
          <View style={{ justifyContent: "flex-end", alignItems: "flex-end" }}>
            <Icon
              name="close-circle-outline"
              size={25}
              color="#fff"
              onPress={() => onClose()}
            />
          </View>

          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View style={{ width: "100%", height: "100%" }}>
              <Image
                source={{ uri: imageUrl }}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ImagePreviewModal;
