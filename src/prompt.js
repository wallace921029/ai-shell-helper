import { createInterface } from "node:readline";

// A reusable single-line ">>> " prompter, backed by one readline.Interface
// for its whole lifetime. This matters for multi-turn use (ash -lc): if a
// chunk of piped/pasted input contains several lines at once, readline
// buffers the extra lines internally — recreating the interface per call
// would silently drop that buffered remainder instead of handing it to the
// next question().
export function createPrompter() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let closed = false;
  rl.once("close", () => {
    closed = true;
  });

  return {
    ask(promptText) {
      if (closed) return Promise.resolve(null);
      return new Promise((resolve) => {
        const onClose = () => resolve(null);
        rl.once("close", onClose);
        rl.question(promptText, (answer) => {
          rl.removeListener("close", onClose);
          resolve(answer);
        });
      });
    },
    close() {
      rl.close();
    },
  };
}

// One-off convenience for call sites that only ever ask a single question.
export function askLine(promptText) {
  const prompter = createPrompter();
  return prompter.ask(promptText).then((answer) => {
    prompter.close();
    return answer;
  });
}
