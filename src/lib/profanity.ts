const blockedWords = [
  "fuck", "shit", "damn", "ass", "bitch", "bastard", "crap",
  " dick", "cock", "piss", "slut", "whore", "cunt", "douche",
  " asshole", "motherfucker",
  "เหี้ย", "ควย", "เย็ด", "ห่า", "สัส", "แตด", "หี", "จิ้ม",
  "มึง", "กู", "เชี่ย", "ส้น", "ตีน", "หน้าหี", "เลว", "ชั่ว",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return blockedWords.some((word) => lower.includes(word));
}

export function maskProfanity(text: string): string {
  let result = text;
  for (const word of blockedWords) {
    const regex = new RegExp(word, "gi");
    result = result.replace(regex, "*".repeat(word.trim().length));
  }
  return result;
}
