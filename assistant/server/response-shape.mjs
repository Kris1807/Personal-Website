const ONE_SENTENCE_REQUEST = /\b(one|single) sentence\b|\bin a sentence\b|במשפט אחד|משפט יחיד/i;

function sentences(value, language) {
  const text = String(value ?? "").trim();
  if (!text) return [];
  if (typeof Intl?.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(language === "he" ? "he" : "en", { granularity: "sentence" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment.trim()).filter(Boolean);
  }
  return text.match(/[^.!?…]+(?:[.!?…]+|$)/g)?.map((part) => part.trim()).filter(Boolean) || [text];
}

export function shapeAnswer(answer, query, language = "en") {
  const limit = ONE_SENTENCE_REQUEST.test(String(query ?? "")) ? 1 : 3;
  return sentences(answer, language).slice(0, limit).join(" ");
}
