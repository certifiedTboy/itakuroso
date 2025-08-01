import { removeAsteriks } from "@/helpers/chat-helpers";
import { useCallback } from "react";
import { FlatList } from "react-native";
import { useSelector } from "react-redux";
import AiMessageBubble from "./AiMessageBubble";

type Message = {
  message: string;
  createdAt: string;
  senderId: string;
  isSender?: boolean;
};

const AiMessageList = ({ aiMessages }: { aiMessages: Message[] }) => {
  const { currentUser } = useSelector((state: any) => state.authState);

  // Memoized render function
  const RenderedCard = useCallback(
    ({ item }: { item: any }) => (
      <AiMessageBubble
        isSender={item.senderId === currentUser?.phoneNumber}
        message={removeAsteriks(item.message)}
        createdAt={item.createdAt}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  return (
    <FlatList
      data={aiMessages}
      renderItem={RenderedCard}
      keyExtractor={keyExtractor}
      numColumns={1}
      inverted={true}
      maxToRenderPerBatch={10}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default AiMessageList;
