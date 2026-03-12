import React, { useState, useEffect, useRef } from "react";

const Typewriter = ({ text, speed = 20, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  // Handle case where text is updated (streaming)
  useEffect(() => {
    // If text changes and we are far behind, we might want to catch up faster
    // but for now, simple append logic handles streaming if text is only appended.
    // If the whole text changes (new message), reset.
    if (!text.startsWith(displayedText)) {
      setDisplayedText("");
      setIndex(0);
    }
  }, [text]);

  return (
    <span className="relative">
      {displayedText}
      {index < text.length && (
        <span className="inline-block w-1 h-4 ml-0.5 bg-indigo-500 animate-pulse align-middle" />
      )}
    </span>
  );
};

export default Typewriter;
