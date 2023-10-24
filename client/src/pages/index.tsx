import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CONNECTION_COUNT_UPDATED_CHANNEL,
  NEW_MESSAGE_CHANNEL,
} from "@/lib/constants";
import useSocket from "@/lib/hooks/useSocket";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  message: string;
  createdAt: string;
};

export default function Home() {
  const messageListRef = useRef<HTMLOListElement | null>(null);
  const socket = useSocket();
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);

  function scrollToBottom() {
    if (messageListRef.current) {
      messageListRef.current.scrollTop =
        messageListRef.current.scrollHeight + 1000;
    }
  }

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("connected");
    });

    socket?.on(NEW_MESSAGE_CHANNEL, (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    });

    socket?.on(
      CONNECTION_COUNT_UPDATED_CHANNEL,
      ({ count }: { count: number }) => {
        setConnectionCount(count);
      }
    );
  }, [socket]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement> | null) {
    e?.preventDefault();
    socket?.emit(NEW_MESSAGE_CHANNEL, { message: newMessage });

    setNewMessage("");
  }

  return (
    <main className="flex flex-col gap-12 bg-slate-900 items-center p-24 h-screen text-3xl justify-center mx-auto min-h-full w-full">
      <ol
        ref={messageListRef}
        className="flex flex-col gap-10 p-10 w-full bg-slate-300 rounded-md max-h-[840px] overflow-y-scroll"
      >
        {messages.map((message, i) => (
          <li
            key={message.id}
            className={` bg-indigo-900 p-6 rounded-xl w-max text-slate-50 flex gap-2 ${
              i % 2 === 0
                ? "self-end rounded-tr-none"
                : "self-start rounded-tl-none"
            }`}
          >
            <span>&quot;{message.message}&quot;</span>
            <span>at: {message.createdAt}</span>
          </li>
        ))}
      </ol>
      <h2>Connection count: {connectionCount}</h2>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        <Textarea
          className="rounded-lg bg-slate-100 p-2 text-xl"
          placeholder="Say hi!"
          value={newMessage}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(null);
            }
          }}
          onChange={(e) => setNewMessage(e.target.value)}
          maxLength={255}
        />
        <Button className="text-4xl py-12 bg-teal-600" type="submit">
          Send
        </Button>
      </form>
    </main>
  );
}
