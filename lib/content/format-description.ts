export interface DescriptionSection {
  heading: string | null;
  text: string;
}

const PHASE_HEADING = /(?<=^|[.!?]\s)([A-Z][A-Z '-]{2,30}):\s*/g;

export function splitDescriptionSections(description: string): DescriptionSection[] {
  if (!description) return [];

  const matches = Array.from(description.matchAll(PHASE_HEADING));
  if (matches.length === 0) return [{ heading: null, text: description }];

  const sections: DescriptionSection[] = [];
  const firstIndex = matches[0].index ?? 0;
  const leading = description.slice(0, firstIndex).trim();
  if (leading) sections.push({ heading: null, text: leading });

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const heading = match[1];
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : description.length;
    const text = description.slice(start, end).trim();
    sections.push({ heading, text });
  }
  return sections;
}
