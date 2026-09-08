// Talks to any OpenAI Chat-Completions-compatible endpoint (OpenAI, DeepSeek, etc).

const CHAT_SYSTEM_PROMPT =
  "You are a helpful, knowledgeable assistant embedded in a command-line tool. " +
  "Answer the user's question directly and conversationally. Your output is printed " +
  "as-is in a terminal (no markdown rendering), so keep formatting simple.";

const SUMMARY_SYSTEM_PROMPT =
  "You compact conversation history for a chat tool that is running low on context space. " +
  "Given a transcript, write a concise but complete summary that preserves key facts, " +
  "decisions, action items, and unresolved questions needed to continue the conversation " +
  "naturally. Do not add commentary about the summarization itself, and write the summary " +
  "in the same language as the transcript.";

function buildCommandSystemPrompt(targetInstruction) {
  return [
    "You are a command-line assistant embedded in a CLI tool.",
    "The user will give you either a plain-language description of what they want to do, " +
      "or a command written for some other platform/shell.",
    "Your job is to translate that into a single, directly runnable command for the user's target shell.",
    targetInstruction,
    "Rules:",
    "- Reply with ONLY the raw command. No explanations, no markdown, no code fences, no backticks.",
    "- Produce exactly one command (use pipes/operators native to the target shell to combine steps if needed).",
    "- Do not wrap the command in quotes unless the quotes are actually part of the command.",
    "- If the input is already a valid command for the target shell, return it unchanged.",
  ].join("\n");
}

function stripFormatting(text) {
  let out = text.trim();
  // Strip a full ```...``` fenced block if the model ignored instructions.
  const fenced = out.match(/^```[a-zA-Z0-9_-]*\n([\s\S]*?)\n?```$/);
  if (fenced) out = fenced[1].trim();
  // Strip a single pair of wrapping backticks.
  if (out.startsWith("`") && out.endsWith("`") && out.length > 1) {
    out = out.slice(1, -1).trim();
  }
  return out;
}

async function callChatCompletions({ baseUrl, apiKey, model, messages, temperature }) {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, temperature, messages }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Request failed (${response.status} ${response.statusText}): ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("The model returned an empty or unexpected response.");
  }

  return content;
}

export async function generateCommand({ baseUrl, apiKey, model, target, input }) {
  const content = await callChatCompletions({
    baseUrl,
    apiKey,
    model,
    temperature: 0,
    messages: [
      { role: "system", content: buildCommandSystemPrompt(target.instruction) },
      { role: "user", content: input },
    ],
  });
  return stripFormatting(content);
}

export async function chatReply({ baseUrl, apiKey, model, history }) {
  const content = await callChatCompletions({
    baseUrl,
    apiKey,
    model,
    temperature: 0.7,
    messages: [{ role: "system", content: CHAT_SYSTEM_PROMPT }, ...history],
  });
  return content.trim();
}

export async function summarizeTranscript({ baseUrl, apiKey, model, transcript }) {
  const content = await callChatCompletions({
    baseUrl,
    apiKey,
    model,
    temperature: 0.3,
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      { role: "user", content: transcript },
    ],
  });
  return content.trim();
}
