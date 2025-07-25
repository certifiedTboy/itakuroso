import { getContacts } from "@/helpers/database/contacts";
import { useGetExisitngRoomsMutation } from "@/lib/apis/chat-apis";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useGetActiveRooms = () => {
  const [getExisitngRooms, { data, isSuccess }] = useGetExisitngRoomsMutation();

  const { currentUser } = useSelector((state: any) => state.authState);

  const [savedContacts, setSavedContacts] = useState<
    { id: string; phoneNumber: string; name: string; roomId?: string }[]
  >([]);

  const [rooms, setRooms] = useState<
    {
      roomId: string;
      roomName?: string;
      contactName?: string;
      contactPhoneNumber?: string;
      roomImage: string;
      lastMessage: {
        isSender: boolean;
        message: string;
        timestamp: string;
        isRead: boolean;
        containsFile?: boolean;
        senderId: string;
      };
    }[]
  >([]);

  useEffect(() => {
    (async () => {
      // console.log("i don mount from here");
      // getExisitngRooms(null);
      const contacts = await getContacts();

      if (contacts && contacts.length > 0) {
        setSavedContacts(
          contacts.filter(
            (contact: any) =>
              contact?.roomId !== null &&
              contact?.phoneNumber !== currentUser?.phoneNumber
          )
        );
      }
    })();
  }, [currentUser]);

  const getExistingRoomsData = () => {
    if (savedContacts && savedContacts.length > 0) {
      setRooms(
        savedContacts.map((contact: any) => {
          return {
            ...contact,
            roomId: contact.roomId,
            contactPhoneNumber: contact.phoneNumber,
            contactName: contact.name,
            roomName: contact?.roomName || "", // this applies for group chats
            roomImage: contact?.roomImage || "",
            lastMessage: {
              messageId: contact?.lastMessageId || "",
              isSender: contact?.lastMessageSenderId !== contact?.phoneNumber,
              message: contact?.lastMessageContent || "",
              timestamp: contact?.lastMessageTimestamp || "",
              isRead: contact?.lastMessageIsRead || false,
              containsFile: !!contact?.lastMessageFile,
              senderId: contact?.lastMessageSenderId || "",
            },
          };
        })
      );
    }
  };

  return [rooms, getExistingRoomsData];
};

export default useGetActiveRooms;
