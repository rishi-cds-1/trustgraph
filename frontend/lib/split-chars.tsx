import type { ReactNode } from "react";

const PUNCTUATION = /[,.!?;:'"()[\]{}\-–—]/;

function splitWord(word: string, wordIndex: number, className?: string) {
  return word.split("").map((char, index) => {
    const display = PUNCTUATION.test(char) ? "inline" : "inline-block";
    return (
      <span
        key={`${wordIndex}-${char}-${index}`}
        className={`char ${display} ${className ?? ""}`}
      >
        {char}
      </span>
    );
  });
}

// Each word is kept in its own `inline-block whitespace-nowrap` wrapper so the
// browser can only break lines *between* words (at the real space text nodes
// below) — never mid-word between two character spans.
export function splitChars(text: string, className?: string) {
  const words = text.split(" ");
  const nodes: ReactNode[] = [];

  words.forEach((word, wordIndex) => {
    if (wordIndex > 0) nodes.push(" ");
    nodes.push(
      <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
        {splitWord(word, wordIndex, className)}
      </span>,
    );
  });

  return nodes;
}
