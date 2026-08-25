import { createElement, Fragment, type ReactNode } from 'react';

// Content descriptions store a constrained subset of markdown (currently
// just **bold** emphasis). This is intentionally not a full markdown
// parser/dependency -- the data only ever uses this one construct -- but it
// keeps raw asterisks from leaking into the rendered UI on cards and detail
// pages. Renders to React nodes directly (no dangerouslySetInnerHTML), so
// there's no HTML-injection risk from homebrew-authored text.
const BOLD_PATTERN = /\*\*(.+?)\*\*/g;

export function renderInlineMarkdown(text: string): ReactNode {
  if (!text) return text;

  BOLD_PATTERN.lastIndex = 0;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = BOLD_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(createElement('strong', { key: key++ }, match[1]));
    lastIndex = BOLD_PATTERN.lastIndex;
  }

  if (parts.length === 0) return text;

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return createElement(Fragment, null, ...parts);
}
