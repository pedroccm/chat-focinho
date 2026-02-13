"use client";

import { TypingIndicator } from "./typing-indicator";
import { ChatPixCard } from "./chat-pix-card";

export interface PixData {
  qrCodeImage: string;
  brCode: string;
  amount: number;
  pixId: string;
  orderId: string;
}

export interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  pixData?: PixData;
  isTyping?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.isTyping) {
    return <TypingIndicator />;
  }

  if (message.type === "bot") {
    return (
      <div className="flex gap-2 items-end" style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
        <div
          className="chat-header-avatar"
          style={{ width: 28, height: 28, flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </div>
        <div className="msg-bot">
          {message.content && <p style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>}
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Generated portrait"
              className="chat-image"
            />
          )}
          {message.pixData && (
            <ChatPixCard
              qrCodeImage={message.pixData.qrCodeImage}
              brCode={message.pixData.brCode}
              amount={message.pixData.amount}
              pixId={message.pixData.pixId}
              orderId={message.pixData.orderId}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="msg-user">
      {message.content && <p>{message.content}</p>}
      {message.imageUrl && (
        <img
          src={message.imageUrl}
          alt="Uploaded photo"
          className="chat-image"
        />
      )}
    </div>
  );
}
