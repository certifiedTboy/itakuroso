import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Contacts from "expo-contacts";
import { insertContacts } from "./database/contacts";

export const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, "");
};

let baseUrl = process.env.EXPO_PUBLIC_API_URL;

export const loadContacts = async () => {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== "granted") {
    await Contacts.requestPermissionsAsync();
  }

  if (status === "granted") {
    const { data } = await Contacts.getContactsAsync({});
    const accessToken = await AsyncStorage.getItem("accessToken");
    const rooms = await axios.get(`${baseUrl}/chats/rooms`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // console.log("Contacts data:", rooms?.data?.data[0].members);

    if (data && rooms?.data?.data && rooms?.data?.statusCode === 200) {
      const contacts = data
        .map((contact) => {
          const number =
            contact?.phoneNumbers && contact?.phoneNumbers?.length > 0
              ? contact?.phoneNumbers[0].number
              : "";

          const name = contact?.name;
          const id = contact?.id;

          return {
            phoneNumber: number ?? "",
            name: name ?? "",
            id: id ?? "",
          };
        })
        .filter(
          (contact) =>
            contact.phoneNumber !== "" ||
            contact?.phoneNumber.length < 11 ||
            contact?.phoneNumber.startsWith("*")
        );

      // Remove unwanted fields from the contact object
      const unwantedFields = [
        "_id",
        "createdAt",
        "updatedAt",
        "isVerified",
        "email",
      ];

      function cleanObject(obj: any) {
        return Object.fromEntries(
          Object.entries(obj).filter(([key]) => !unwantedFields.includes(key))
        );
      }

      const map = new Map();

      contacts.forEach((item) => {
        map.set(formatPhoneNumber(item.phoneNumber || ""), { ...item });
      });

      rooms?.data?.data?.forEach((room: any) => {
        room?.members?.forEach((member: any) => {
          const cleanedObject = cleanObject(member);
          if (map.has(formatPhoneNumber(member?.phoneNumber || ""))) {
            map.set(formatPhoneNumber(member?.phoneNumber || ""), {
              ...map.get(formatPhoneNumber(member?.phoneNumber || "")),
              ...cleanedObject,
              roomId: room.roomId,
              isActive: member?.isActive,
            });
          } else {
            map.set(formatPhoneNumber(member?.phoneNumber || ""), {
              ...cleanedObject,
              roomId: room.roomId,
              isActive: member?.isActive,
            });
          }
        });
      });

      const mergedArray = Array.from(map.values());

      await insertContacts(mergedArray);
    }
  }
};
