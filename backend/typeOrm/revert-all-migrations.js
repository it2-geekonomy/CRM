/**
 * Reverts all executed migrations one by one.
 * Runs "pnpm typeorm migration:revert" in a loop until no migrations are left.
 */
const { execSync } = require('child_process');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const maxRounds = 50; // safety limit

let reverted = 0;
for (let i = 0; i < maxRounds; i++) {
  try {
    const result = execSync('pnpm typeorm migration:revert -d typeOrm/config.ts', {
      cwd: backendRoot,
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe'],
    });
    const output = (result || '').toString();
    if (output) process.stdout.write(output);
    if (/nothing to revert|no migrations were found/i.test(output)) {
      break;
    }
    reverted++;
  } catch (err) {
    const stdout = (err.stdout && err.stdout.toString) ? err.stdout.toString() : '';
    const stderr = (err.stderr && err.stderr.toString) ? err.stderr.toString() : '';
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    const out = stdout + stderr;
    if (/nothing to revert|no migrations were found/i.test(out)) {
      break;
    }
    if (reverted === 0) {
      console.error('Revert failed:', (err.stderr && err.stderr.toString()) || err.message);
      process.exit(1);
    }
    break;
  }
}

console.log('Reverted ' + reverted + ' migration(s).');
process.exit(0);
