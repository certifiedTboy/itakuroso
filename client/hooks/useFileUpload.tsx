import { Cloudinary } from "@cloudinary/url-gen";
import { upload } from "cloudinary-react-native";
import { useState } from "react";

const useFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<{
    type: string;
    uri: string;
  }>({ type: "", uri: "" });
  const [isUploading, setIsUploading] = useState(false);

  const cld = new Cloudinary({
    cloud: {
      cloudName: "dmdnusfre",
    },
    url: {
      secure: true,
    },
  });

  const options: { upload_preset: string; unsigned: boolean } = {
    upload_preset: "class_chat_app",
    unsigned: true,
  };

  const uploadFile = async (file: string) => {
    try {
      await upload(cld, {
        file,
        options,
        callback: (error: any, response: any) => {
          if (error) {
            console.log("error", error);
          } else {
            setUploadedFile({
              type: response?.resource_type,
              uri: response?.secure_url,
            });
          }
        },
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile({ type: "", uri: "" });
  };

  return { uploadFile, uploadedFile, isUploading, clearUploadedFile };
};

export default useFileUpload;
