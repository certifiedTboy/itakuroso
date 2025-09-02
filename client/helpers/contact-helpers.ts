import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Contacts from "expo-contacts";
import { insertContacts } from "./database/contacts";
import { insertGroupChat } from "./database/group-chat";

export const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, "");
};

let baseUrl = process.env.EXPO_PUBLIC_API_URL;

export const loadContacts = async () => {
  try {
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

        const unwantedFields = [
          "_id",
          "createdAt",
          "updatedAt",
          "isVerified",
          "email",
          "passwordResetToken",
          "passwordResetTokenExpiresIn",
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
  } catch (error) {
    console.log(error);
  }
};

export const loadUsersGroups = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const response = await axios.get(`${baseUrl}/chats/groups`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const groups = response?.data?.data;

    if (groups && groups.length > 0) {
      for (let group of groups) {
        const groupData = {
          id: group.roomId,
          groupName: group.roomName,
          roomId: group.roomId,
          groupImage: group.roomImage,
          members: group.members.map((member: any) => member.phoneNumber),
          roomLink: group.roomLink || " ",
        };

        await insertGroupChat(groupData);
      }
    }
  } catch (error) {
    console.log("error from loading users group", error);
  }
};
