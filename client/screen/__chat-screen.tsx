import MessageBubble from "@/components/chats/MessageBubble";
import { generateRoomId } from "@/helpers/chat-helpers";
import { getLocalChatsByRoomId } from "@/helpers/database/chats";
// import { useGetChatsByRoomIdMutation } from "@/lib/apis/chat-apis";
import { ThemedView } from "@/components/ThemedView";
import { ChatContext } from "@/lib/context/chat-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";

import MessageInput from "@/components/chats/MessageInput";
import { useSelector } from "react-redux";

const { height, width } = Dimensions.get("window");

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params: {
      contactName: string;
      phoneNumber: string;
      roomId: string;
      senderId: string;
      isRead: boolean;
    };
  };
};

type ListItem = {
  _id: string;
  senderId: string;
  message: string;
  file?: string;
  createdAt: string;
  isSender: boolean;
  // setMessageToRespondTo: (message: { message: string; _id: string }) => void;
  // replyTo?: { replyToId: string; replyToMessage: string; senderId?: string };
};

const ChatScreen = ({ route }: ChatScreenProps) => {
  const [messageToRespondTo, setMessageToRespondTo] = useState<{
    message: string;
    _id: string;
  } | null>(null);

  const [dataProvider, setDataProvider] = useState(
    new DataProvider(
      (r1: ListItem, r2: ListItem) => r1._id !== r2._id
    ).cloneWithRows([])
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const chatCtx = useContext(ChatContext);
  const { contactName, phoneNumber, roomId } = route.params;
  // const [getChatsByRoomId, { data, isSuccess }] = useGetChatsByRoomIdMutation();
  const { currentUser } = useSelector((state: any) => state.authState);

  // Layout provider must be stable (useRef or outside component)
  const layoutProvider = useRef(
    new LayoutProvider(
      () => "NORMAL",
      (type, dim) => {
        dim.width = width;
        dim.height = 100; // Must specify height
      }
    )
  ).current;

  // Update context messages when fetched
  useFocusEffect(
    useCallback(() => {
      const onGetLocalChats = async () => {
        const result = (await getLocalChatsByRoomId(roomId)) ?? [];

        if (result && result.length > 0) {
          chatCtx.updateSocketMessages(result, currentUser);
        }
      };

      onGetLocalChats();
    }, [])
  );

  // Initialize or update data

  useEffect(() => {
    setDataProvider(dataProvider.cloneWithRows(chatCtx.messages));
  }, [chatCtx.messages]);

  // Handle infinite scroll
  // const handleEndReached = () => {
  //   if (loadingMore) return;

  //   setLoadingMore(true);
  //   setTimeout(() => {
  //     const newItems: ListItem[] = Array.from({ length: 20 }, (_, i) => ({
  //       id: data.length + i,
  //       title: `New Item ${data.length + i + 1}`,
  //       description: `New description ${data.length + i + 1}`,
  //     }));

  //     const updatedData = [...data, ...newItems];
  //     setData(updatedData);
  //     setDataProvider(dataProvider.cloneWithRows(updatedData));
  //     setLoadingMore(false);
  //   }, 1500);
  // };

  useFocusEffect(
    useCallback(() => {
      if (!roomId) {
        chatCtx.joinRoom(
          { contactName, phoneNumber },
          { phoneNumber: currentUser?.phoneNumber, email: currentUser?.email },
          generateRoomId()
        );
      } else {
        chatCtx.joinRoom(
          { contactName, phoneNumber },
          { phoneNumber: currentUser?.phoneNumber, email: currentUser?.email },
          roomId
        );
        // getChatsByRoomId({ roomId });
      }
    }, [])
  );

  // Mark as read & leave room on blur
  useFocusEffect(
    useCallback(() => {
      if (
        route.params?.senderId !== currentUser?.phoneNumber &&
        !route.params?.isRead
      ) {
        chatCtx.markMessageAsRead(roomId);
      }

      return () => {
        chatCtx.leaveRoom({ phoneNumber: currentUser?.phoneNumber });
        chatCtx.updateSocketMessages([], currentUser);
      };
    }, [])
  );

  // Memoized render function
  const RenderedCard = useCallback(
    ({ item }: { item: any }) => (
      <MessageBubble
        message={{
          ...item,
          isSender: item.senderId === currentUser?.phoneNumber,
          setMessageToRespondTo,
          type: item.type ?? "text", // Provide a default or actual type
        }}
      />
    ),
    [currentUser?.phoneNumber]
  );

  // Row renderer with proper typing
  const rowRenderer = (type: string | number, item: ListItem) => {
    return (
      <MessageBubble
        message={{
          ...item,
          isSender: item.senderId === currentUser?.phoneNumber,
          setMessageToRespondTo,
          type: (item as any).type ?? "text", // Provide a default or actual type
        }}
      />
    );
  };

  return (
    <ThemedView
      style={styles.messagesContainer}
      darkColor="#000"
      lightColor="#fff"
    >
      {/* <FlatList
        data={chatCtx.messages}
        renderItem={RenderedCard}
        keyExtractor={(item: any) => item._id}
        numColumns={1}
        scrollEventThrottle={16}
        initialNumToRender={15}
        maxToRenderPerBatch={5}
        windowSize={11}
        // windowSize={5}
        // removeClippedSubviews

        inverted={true}
        onEndReachedThreshold={0.5}
        // onEndReached={() => {
        //   if (chatCtx.messages.length > 0) {
        //     setPageNum(pageNum + 1);
        //   }
        // }}
        // onStartReached={() => console.log("Start reached")}
        contentContainerStyle={styles.messageContentStyle}
      /> */}
      {chatCtx.messages && chatCtx.messages.length > 0 && (
        <RecyclerListView
          style={styles}
          dataProvider={dataProvider}
          layoutProvider={layoutProvider}
          rowRenderer={rowRenderer}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <MessageInput
          receiverId={phoneNumber}
          roomId={roomId}
          messageToRespondTo={messageToRespondTo}
          setMessageToRespondTo={setMessageToRespondTo}
        />
      </KeyboardAvoidingView>
    </ThemedView>

    // <View style={styles.container}>
    //   {data.length > 0 ? (

    //   ) : (
    //     <Text>Loading...</Text>
    //   )}

    //   <MessageInput
    //     receiverId={phoneNumber}
    //     roomId={roomId}
    //     messageToRespondTo={messageToRespondTo}
    //     setMessageToRespondTo={setMessageToRespondTo}
    //   />
    // </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 9,

    // alignItems: "flex-end",
    // backgroundColor: "red",
  },
  messageContentStyle: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 10,
  },

  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    justifyContent: "center",
    height: 100,
  },
});
