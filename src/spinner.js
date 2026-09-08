// A minimal spinner that only ever writes to stdout. @clack/prompts' own
// spinner() also attaches a listener to stdin (to catch a cancel keypress
// while spinning), which collides with our persistent readline.Interface in
// prompt.js and silently breaks input after the first use — see ash -lc.
const FRAMES = ["|", "/", "-", "\\"];

export function createSpinner() {
  let timer = null;
  let frame = 0;

  return {
    start(message) {
      process.stdout.write(`${FRAMES[0]} ${message}`);
      timer = setInterval(() => {
        frame = (frame + 1) % FRAMES.length;
        process.stdout.write(`\r${FRAMES[frame]} ${message}`);
      }, 100);
    },
    stop(finalMessage) {
      clearInterval(timer);
      process.stdout.write(`\r\x1b[K${finalMessage}\n`);
    },
  };
}
