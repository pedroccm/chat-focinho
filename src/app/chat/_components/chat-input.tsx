"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  mask?: (value: string) => string;
  type?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function ChatInput({
  placeholder,
  onSubmit,
  mask,
  type = "text",
  disabled = false,
  autoFocus = true,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setValue(mask ? mask(raw) : raw);
  };

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-text-input">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        className="chat-send-btn"
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        aria-label="Enviar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
