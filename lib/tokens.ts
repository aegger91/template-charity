import tokens from "@/design/tokens.json";

type Group = Record<string, string | number>;

/** Turns design/tokens.json into CSS custom properties: color.primary becomes --token-color-primary. */
export function tokensToCss() {
  const lines: string[] = [];
  for (const [group, values] of Object.entries(tokens)) {
    if (group.startsWith("$") || typeof values !== "object") continue;
    for (const [name, value] of Object.entries(values as Group)) {
      lines.push(`--token-${group}-${name}:${value};`);
    }
  }
  return `:root{${lines.join("")}}`;
}

export const motion = tokens.motion;
export const brandColors = tokens.color;
