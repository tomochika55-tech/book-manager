import Anthropic from "@anthropic-ai/sdk";
import type { Recommendation } from "@/lib/recommend";

type BookLike = {
  title: string;
  author: string;
  genre: string | null;
  status: string;
  rating: number | null;
  review: string | null;
};

export type AiProvider = "claude" | "gemini" | null;

// 設定されている API キーから使用プロバイダを判定する。
export function activeAiProvider(): AiProvider {
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

// LLM に渡すためにユーザーの読書履歴を短いテキストにまとめる。
function summarizeHistory(books: BookLike[]): string {
  const finished = books.filter((b) => b.status === "finished");
  const lines = finished.slice(0, 30).map((b) => {
    const stars = b.rating != null ? `★${b.rating}` : "未評価";
    const genre = b.genre ? `[${b.genre}]` : "";
    return `- ${b.title}（${b.author}）${genre} ${stars}`;
  });
  const owned = books.map((b) => b.title).join(" / ");
  return `読了した本:\n${lines.join("\n") || "（まだありません）"}\n\n既に登録済み（重複回避）: ${owned || "なし"}`;
}

const SYSTEM_PROMPT =
  "あなたは読書アドバイザーです。ユーザーの読書履歴と評価から好みを分析し、" +
  "まだ読んでいない『次の一冊』を提案します。実在する書籍のみを挙げ、" +
  "登録済みの本は避けてください。必ず指定された JSON 形式で回答してください。";

function buildPrompt(books: BookLike[]): string {
  return (
    `${summarizeHistory(books)}\n\n` +
    "この読者の好みを踏まえて、次に読むとよい本を3冊、日本語で提案してください。" +
    "各提案には title, author, genre, reason を含めてください。" +
    "reason は本の裏表紙のあらすじのように、あらすじ・見どころを3〜5文程度で具体的に紹介し、" +
    "文末で簡潔にこの読者へのおすすめ理由に触れてください（ネタバレとなる結末は避ける）。"
  );
}

type AiBook = { title: string; author: string; genre: string; reason: string };

const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          author: { type: "string" },
          genre: { type: "string" },
          reason: { type: "string" },
        },
        required: ["title", "author", "genre", "reason"],
      },
    },
  },
  required: ["recommendations"],
} as const;

// Claude（Anthropic 公式 SDK）で提案を得る。
async function recommendWithClaude(books: BookLike[]): Promise<AiBook[]> {
  const client = new Anthropic(); // ANTHROPIC_API_KEY を自動で読む
  const res = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(books) }],
    output_config: { format: { type: "json_schema", schema: JSON_SCHEMA } },
  });
  const text = res.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return [];
  const parsed = JSON.parse(text.text) as { recommendations?: AiBook[] };
  return parsed.recommendations ?? [];
}

// Gemini（Google 生成 AI REST API）で提案を得る。
async function recommendWithGemini(books: BookLike[]): Promise<AiBook[]> {
  const key = process.env.GEMINI_API_KEY;
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    key;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: buildPrompt(books) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  author: { type: "string" },
                  genre: { type: "string" },
                  reason: { type: "string" },
                },
                required: ["title", "author", "genre", "reason"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return [];
  const parsed = JSON.parse(text) as { recommendations?: AiBook[] };
  return parsed.recommendations ?? [];
}

/**
 * AI で「次の一冊」を提案する。API キーが無い、または失敗した場合は null を返し、
 * 呼び出し側で従来ロジック（recommendNextBooks）へフォールバックさせる。
 */
export async function recommendWithAi(
  books: BookLike[],
): Promise<Recommendation[] | null> {
  const provider = activeAiProvider();
  if (!provider) return null;

  try {
    const owned = new Set(books.map((b) => b.title.trim()));
    const raw =
      provider === "claude"
        ? await recommendWithClaude(books)
        : await recommendWithGemini(books);

    const recs = raw
      .filter((b) => b.title && !owned.has(b.title.trim()))
      .slice(0, 3)
      .map((b) => ({
        book: { title: b.title, author: b.author, genre: b.genre, reason: b.reason },
        basedOn: "AIがあなたの読書履歴と評価から選びました",
      }));

    // AI が空を返したら null 扱いでフォールバック
    return recs.length > 0 ? recs : null;
  } catch (err) {
    console.error("[ai] recommendation failed, falling back:", err);
    return null;
  }
}
