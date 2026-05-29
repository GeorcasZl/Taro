import type { KeyboardEvent as ReactKeyboardEvent } from "react";

type StudioKeyboardEvent = KeyboardEvent | ReactKeyboardEvent;

export function isPrimaryK(event: StudioKeyboardEvent): boolean {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
}

export function isSameGroupEnter(event: StudioKeyboardEvent): boolean {
  return event.key === "Enter" && event.altKey;
}

export function isLineBreakEnter(event: StudioKeyboardEvent): boolean {
  return event.key === "Enter" && event.shiftKey;
}

export function isNextGroupEnter(event: StudioKeyboardEvent): boolean {
  return event.key === "Enter" && !event.altKey && !event.shiftKey;
}
