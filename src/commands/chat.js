import { log } from "@clack/prompts";
import { loadConfig } from "../config.js";
import { chatReply, summarizeTranscript } from "../ai.js";
import { askLine, createPrompter } from "../prompt.js";
import { createSpinner } from "../spinner.js";

// Rough proxy for "running low on context" — we can't run a real tokenizer
// against an arbitrary OpenAI-compatible provider, so character count is the
// closest cheap approximation (~4 chars/token for English, less for CJK,
// so this triggers earlier than strictly necessary for non-English chats,
// which is the safer direction to be wrong in).
const COMPACT_CHAR_THRESHOLD = 12000;
// How many of the most recent messages to keep verbatim when compacting.
const KEEP_RECENT_MESSAGES = 6;

function requireConfig() {
  const config = loadConfig();
  if (!config || !config.baseUrl || !config.apiKey || !config.model) {
    log.error('No model configured yet. Run "ash init" first.');
    process.exitCode = 1;
    return null;
  }
  return config;
}

async function ask(config, history) {
  const s = createSpinner();
  s.start("Thinking...");
  try {
    const reply = await chatReply({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      history,
    });
    s.stop("Done.");
    return reply;
  } catch (err) {
    s.stop("Failed.");
    log.error(err.message || String(err));
    return null;
  }
}

function historyCharCount(history) {
  return history.reduce((total, m) => total + m.content.length, 0);
}

function roleLabel(role) {
  if (role === "user") return "User";
  if (role === "assistant") return "Assistant";
  return "Earlier summary";
}

async function compactHistory(config, history) {
  if (history.length <= KEEP_RECENT_MESSAGES) return history;

  const older = history.slice(0, -KEEP_RECENT_MESSAGES);
  const recent = history.slice(-KEEP_RECENT_MESSAGES);
  const transcript = older.map((m) => `${roleLabel(m.role)}: ${m.content}`).join("\n\n");

  const s = createSpinner();
  s.start("Compacting conversation...");
  try {
    const summary = await summarizeTranscript({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      transcript,
    });
    s.stop("Done.");
    log.info(`Context compacted (${older.length} messages summarized, ${recent.length} kept).`);
    return [{ role: "system", content: `Summary of earlier conversation:\n${summary}` }, ...recent];
  } catch (err) {
    s.stop("Failed.");
    log.warn(`Could not compact conversation, continuing with full history: ${err.message || err}`);
    return history;
  }
}

// `ash -c` / `ash --chat`: one question, one answer.
export async function runChatOnce() {
  const config = requireConfig();
  if (!config) return;

  const input = await askLine(">>> ");
  if (input === null || !input.trim()) return;

  const reply = await ask(config, [{ role: "user", content: input.trim() }]);
  if (reply !== null) console.log(reply);
}

// `ash -lc` / `ash --loop-chat`: keeps context across turns until Ctrl+C.
export async function runChatLoop() {
  const config = requireConfig();
  if (!config) return;

  log.info("Chat mode — press Ctrl+C to exit.");

  let history = [];
  const prompter = createPrompter();
  process.on("SIGINT", () => {
    console.log("\nBye!");
    process.exit(0);
  });

  for (;;) {
    const input = await prompter.ask(">>> ");
    if (input === null) {
      console.log("\nBye!");
      prompter.close();
      return;
    }
    if (!input.trim()) continue;

    history.push({ role: "user", content: input.trim() });

    if (historyCharCount(history) > COMPACT_CHAR_THRESHOLD) {
      history = await compactHistory(config, history);
    }

    const reply = await ask(config, history);
    if (reply === null) {
      history.pop();
      continue;
    }
    history.push({ role: "assistant", content: reply });
    console.log(reply);
  }
}
