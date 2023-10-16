import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NEW_MESSAGE_CHANNEL } from "@/lib/constants";
import useSocket from "@/lib/hooks/useSocket";
import { useEffect, useState } from "react";

type Message = {
  id: string;
  message: string;
  createdAt: string;
};

export default function Home() {
  const socket = useSocket();
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("connected");
    });

    socket?.on(NEW_MESSAGE_CHANNEL, (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, [socket]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement> | null) {
    e?.preventDefault();
    socket?.emit(NEW_MESSAGE_CHANNEL, { message: newMessage });

    setNewMessage("");
  }

  return (
    <main className="flex flex-col gap-20 bg-slate-900 items-center p-32 h-screen text-3xl justify-center mx-auto min-h-full w-full">
      <div className="flex flex-col gap-10 p-10 w-full bg-slate-300 rounded-md max-h-[720px] overflow-y-scroll">
        {messages.map((message, i) => (
          <div
            key={message.id}
            className={` bg-indigo-900 p-6 rounded-xl w-max text-slate-50 flex gap-2 ${
              i % 2 === 0
                ? "self-end rounded-tr-none"
                : "self-start rounded-tl-none"
            }`}
          >
            <span>&quot;{message.message}&quot;</span>
            <span>at: {message.createdAt}</span>
          </div>
        ))}
      </div>
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
