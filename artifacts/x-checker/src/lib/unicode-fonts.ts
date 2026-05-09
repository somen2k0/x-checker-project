export interface FontStyle {
  key: string;
  name: string;
  sample: string;
  lower: number;  // offset from 'a' (97)
  upper: number;  // offset from 'A' (65)
  digit?: number; // offset from '0' (48)
  exceptions?: Record<string, string>;
}

export const FONT_STYLES: FontStyle[] = [
  {
    key: "bold",
    name: "𝐁𝐨𝐥𝐝",
    sample: "𝐀𝐁𝐂 𝐚𝐛𝐜",
    lower: 0x1D41A - 97,
    upper: 0x1D400 - 65,
    digit: 0x1D7CE - 48,
  },
  {
    key: "italic",
    name: "𝘐𝘵𝘢𝘭𝘪𝘤",
    sample: "𝐴𝐵𝐶 𝑎𝑏𝑐",
    lower: 0x1D44E - 97,
    upper: 0x1D434 - 65,
    exceptions: { h: "ℎ" },
  },
  {
    key: "boldItalic",
    name: "𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄",
    sample: "𝑨𝑩𝑪 𝒂𝒃𝒄",
    lower: 0x1D482 - 97,
    upper: 0x1D468 - 65,
  },
  {
    key: "script",
    name: "𝒮𝒸𝓇𝒾𝓅𝓉",
    sample: "𝒜ℬ𝒞 𝒶𝒷𝒸",
    lower: 0x1D4B6 - 97,
    upper: 0x1D49C - 65,
    exceptions: {
      B: "ℬ", E: "ℰ", F: "ℱ", H: "ℋ", I: "ℐ", L: "ℒ", M: "ℳ", R: "ℛ",
      e: "ℯ", g: "ℊ", o: "ℴ",
    },
  },
  {
    key: "boldScript",
    name: "𝓑𝓸𝓵𝓭 𝓢𝓬𝓻𝓲𝓹𝓽",
    sample: "𝓐𝓑𝓒 𝓪𝓫𝓬",
    lower: 0x1D4EA - 97,
    upper: 0x1D4D0 - 65,
  },
  {
    key: "fraktur",
    name: "𝔉𝔯𝔞𝔨𝔱𝔲𝔯",
    sample: "𝔄𝔅ℭ 𝔞𝔟𝔠",
    lower: 0x1D51E - 97,
    upper: 0x1D504 - 65,
    exceptions: { C: "ℭ", H: "ℌ", I: "ℑ", R: "ℜ", Z: "ℨ" },
  },
  {
    key: "doubleStruck",
    name: "𝔻𝕠𝕦𝕓𝕝𝕖",
    sample: "𝔸𝔹ℂ 𝕒𝕓𝕔",
    lower: 0x1D552 - 97,
    upper: 0x1D538 - 65,
    digit: 0x1D7D8 - 48,
    exceptions: {
      C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ",
    },
  },
  {
    key: "sansSerif",
    name: "Sans-serif",
    sample: "𝖠𝖡𝖢 𝖺𝖻𝖼",
    lower: 0x1D5BA - 97,
    upper: 0x1D5A0 - 65,
    digit: 0x1D7E2 - 48,
  },
  {
    key: "sansBold",
    name: "𝗦𝗮𝗻𝘀 𝗕𝗼𝗹𝗱",
    sample: "𝗔𝗕𝗖 𝗮𝗯𝗰",
    lower: 0x1D5EE - 97,
    upper: 0x1D5D4 - 65,
    digit: 0x1D7EC - 48,
  },
  {
    key: "sansItalic",
    name: "𝘚𝘢𝘯𝘴 𝘐𝘵𝘢𝘭𝘪𝘤",
    sample: "𝘈𝘉𝘊 𝘢𝘣𝘤",
    lower: 0x1D622 - 97,
    upper: 0x1D608 - 65,
  },
  {
    key: "sansBoldItalic",
    name: "𝙎𝙖𝙣𝙨 𝘽𝙤𝙡𝙙 𝙄𝙩𝙖𝙡𝙞𝙘",
    sample: "𝘼𝘽𝘾 𝙖𝙗𝙘",
    lower: 0x1D656 - 97,
    upper: 0x1D63C - 65,
  },
  {
    key: "monospace",
    name: "𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎",
    sample: "𝙰𝙱𝙲 𝚊𝚋𝚌",
    lower: 0x1D68A - 97,
    upper: 0x1D670 - 65,
    digit: 0x1D7F6 - 48,
  },
];

export function convertToFont(text: string, style: FontStyle): string {
  return text
    .split("")
    .map((ch) => {
      if (style.exceptions && ch in style.exceptions) {
        return style.exceptions[ch];
      }
      const code = ch.codePointAt(0)!;
      if (code >= 97 && code <= 122) {
        return String.fromCodePoint(code + style.lower);
      }
      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(code + style.upper);
      }
      if (style.digit !== undefined && code >= 48 && code <= 57) {
        return String.fromCodePoint(code + style.digit);
      }
      return ch;
    })
    .join("");
}
