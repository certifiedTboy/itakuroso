/**
 * type definition for a message queue nodde
 */
export type QueueNodeType = {
  roomId: string;
  senderId: string;
  content: string;
  file?: string;
  replyTo?: {
    replyToId: string;
    replyToMessage: string;
    replyToSenderId: string;
  } | null;
  createdAt: string;
};

/**
 * A class representing a node in the message queue.
 * Each node contains a value of type QueueNodeType and a reference to the next node.
 * This structure allows for the creation of a linked list to manage messages in a queue.
 */
class QueueNode {
  value: QueueNodeType;
  next: QueueNode | null;
  constructor(value: QueueNodeType) {
    this.value = value;
    this.next = null;
  }
}

/**
 * A class representing a message queue.
 * It manages a linked list of messages, allowing for enqueueing and dequeueing operations.
 * The queue is associated with an owner, which is typically the user or room it belongs to.
 */
export class MessageQueue {
  owner: string;
  first: QueueNode | null;
  last: QueueNode | null;
  size: number;
  constructor(owner: string) {
    this.owner = owner;
    this.first = null;
    this.last = null;
    this.size = 0;
  }
  enqueue(messageData: QueueNodeType) {
    const newNode = new QueueNode(messageData);
    if (!this.first) {
      this.first = newNode;
      this.last = newNode;
    } else {
      if (this.last) {
        this.last.next = newNode;
        this.last = newNode;
      }
    }
    return ++this.size;
  }

  dequeue() {
    if (!this.first) return null;

    const temp = this.first;
    if (this.first === this.last) {
      this.last = null;
    }
    this.first = this.first.next;
    this.size--;
    return temp.value;
  }
}
