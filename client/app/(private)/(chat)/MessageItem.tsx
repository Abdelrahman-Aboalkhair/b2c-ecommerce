import React from "react";
import AudioPlayer from "./AudioPlayer";
import Image from "next/image";

interface MessageItemProps {
  message: any;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
}) => {
  const isImage = message.type === "IMAGE";
  const isAudio = message.type === "AUDIO";

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${
          isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {isImage && message.url ? (
          <Image
            src={message.url}
            alt="Sent image"
            width={200}
            height={200}
            className="max-w-full h-auto rounded-lg"
            onError={(e) => console.error("Image failed to load:", message.url)}
          />
        ) : isAudio && message.url ? (
          <AudioPlayer src={message.url} />
        ) : (
          <p>{message.content || "No content"}</p>
        )}
        <span className="text-xs text-gray-400 mt-1 block">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
