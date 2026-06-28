export  function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*/g, '')      // remove bold **
    .replace(/\*/g, '')        // remove single *
    .replace(/`/g, '')         // remove code ticks
    .replace(/\n/g, ' ')       // remove line breaks
    .replace(/\s+/g, ' ')      // normalize spaces
    .trim();
}