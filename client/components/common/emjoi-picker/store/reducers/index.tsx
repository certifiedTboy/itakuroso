import recentEmojiReducer, {
  type RecentEmojiAction,
  type RecentEmojiState,
} from "./recent-emjoi-reducer";

// TODO:
// - combine Keyboard reducers in future

export type KeyboardState = RecentEmojiState;
export type KeyboardAction = RecentEmojiAction;
export default recentEmojiReducer;
