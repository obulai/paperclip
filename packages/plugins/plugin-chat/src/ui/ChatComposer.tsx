import { useState, type FormEvent } from "react";
import { styles } from "./styles.js";

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <form style={styles.composerForm} onSubmit={handleSubmit}>
      <input
        style={styles.input}
        type="text"
        placeholder={disabled ? "Waiting for response..." : "Type a message..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" style={styles.sendButton(disabled || !text.trim())} disabled={disabled || !text.trim()}>
        Send
      </button>
    </form>
  );
}
