import React, { useState, useEffect, useRef } from "react";

const Typewriter = ({ text, speed = 20, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  // Use a ref for the index so we only trigger ONE setState per tick
  const indexRef = useRef(0);
  // Track which text we've been initialized for to detect a full text change
  const textRef = useRef(text);

  useEffect(() => {
    // If the text has fundamentally changed (not just appended to), reset
    if (!text.startsWith(textRef.current) && !textRef.current.startsWith(text)) {
      setDisplayedText("");
      indexRef.current = 0;
    }
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (indexRef.current >= text.length) {
      if (onComplete) onComplete();
      return;
    }

    // Only a single setState per tick — half the renders vs the old approach
    const timeout = setTimeout(() => {
      const next = indexRef.current;
      if (next < text.length) {
        setDisplayedText(text.slice(0, next + 1));
        indexRef.current = next + 1;
      }
    }, speed);

    return () => clearTimeout(timeout);
  // Re-run only when displayedText length changes, not on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedText, text, speed, onComplete]);

  const done = indexRef.current >= text.length;

  return (
    <span className="relative">
      {displayedText}
      {!done && (
        <span className="inline-block w-1 h-4 ml-0.5 bg-indigo-500 animate-pulse align-middle" />
      )}
    </span>
  );
};

export default React.memo(Typewriter);
