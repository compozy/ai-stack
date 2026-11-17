// Creates a project from this template: `bun scripts/create.ts <name> --shape start|api`.
// Template-only: it is not copied into generated projects. See INSTRUCTIONS.md.
import { randomBytes } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

// Skills are vendored in `.agents/skills` (lock: `skills-lock.json`) and copied verbatim; each shape
// removes the ones it has no use for through the skills CLI, so the lock stays consistent.
const SHAPES = {
  start: { drop: ["apps/api", "apps/app"], removeSkills: ["hono"] },
  api: { drop: ["apps/web"], removeSkills: [] },
} as const;
type Shape = keyof typeof SHAPES;

const SKILLS_CLI = "skills@1.8.1";
const SKILLS_DIR = ".agents/skills/";
const SKILLS_LOCK = "skills-lock.json";
const TEMPLATE_ONLY = [
  "README.md",
  "LICENSE",
  "INSTRUCTIONS.md",
  "scripts/create.ts",
  ".github/workflows/template.yml",
];

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    shape: { type: "string", default: "start" },
    dir: { type: "string" },
    "no-skills": { type: "boolean", default: false },
    "no-install": { type: "boolean", default: false },
  },
});

const name = positionals[0] ?? "";
const shape = values.shape as Shape;
if (!name || !/^[a-z][a-z0-9-]*$/.test(name) || !(shape in SHAPES)) {
  console.error("Usage: bun scripts/create.ts <name> [--shape start|api] [--dir <path>]");
  console.error("       [--no-skills] [--no-install]");
  process.exit(1);
}

const template = resolve(import.meta.dirname, "..");
const target = resolve(values.dir ?? name);
if (existsSync(target)) throw new Error(`${target} already exists`);
const title = name.replace(
  /(^|-)(\w)/g,
  (_, dash: string, c: string) => (dash ? " " : "") + c.toUpperCase()
);
const other = Object.keys(SHAPES).filter(s => s !== shape);
const dropped = [...TEMPLATE_ONLY, ...SHAPES[shape].drop];

const run = (cmd: string[], env: Record<string, string> = {}) => {
  console.log(`$ ${cmd.join(" ")}`);
  const proc = Bun.spawnSync(cmd, {
    cwd: target,
    stdio: ["inherit", "inherit", "inherit"],
    env: { ...process.env, ...env },
  });
  if (proc.exitCode !== 0) throw new Error(`Failed: ${cmd.join(" ")}`);
};

/** Removes `<shape:x>` … `</shape:x>` blocks of other shapes and the markers of this one. */
function transform(text: string): string {
  const lines: string[] = [];
  let skipping: string | null = null;
  for (const line of text.split("\n")) {
    const open = line.match(/<shape:(\w+)>/)?.[1];
    const close = line.match(/<\/shape:(\w+)>/)?.[1];
    if (open) skipping = other.includes(open) ? open : null;
    else if (close) skipping = null;
    else if (!skipping) lines.push(line);
  }
  return lines
    .join("\n")
    .replace(/\bacme\b/g, name)
    .replace(/\bAcme\b/g, title);
}

/** Recipes declare their shapes in frontmatter (`shapes: [start, api]`). */
function recipeFits(text: string): boolean {
  const shapes = text.match(/^shapes:\s*\[(.*)\]/m)?.[1];
  return (
    !shapes ||
    shapes
      .split(",")
      .map(s => s.trim())
      .includes(shape)
  );
}

/**
 * A free Postgres port derived from the name (15432–16431), so projects that are not running yet
 * still get distinct ports; walks up when the derived one is taken.
 */
async function freePort(port = 15432 + (Bun.hash.crc32(name) % 1000)): Promise<number> {
  const free = await new Promise<boolean>(done => {
    const server = createServer().once("error", () => done(false));
    server.listen(port, "127.0.0.1", () => server.close(() => done(true)));
  });
  return free ? port : freePort(port + 1);
}

/** Files owned by the skills CLI: the lock and every skill folder. */
function isVendoredSkill(file: string): boolean {
  return file === SKILLS_LOCK || file.startsWith(SKILLS_DIR);
}

// 1. Copy tracked and unignored files, minus template-only files and the other shape.
const listed = Bun.spawnSync(
  ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: template }
);
const files = listed.stdout.toString().split("\0").filter(Boolean);
for (const file of files) {
  if (dropped.some(path => file === path || file.startsWith(`${path}/`))) continue;
  // postinstall links AGENTS.md → CLAUDE.md; a skill's own AGENTS.md is a real file.
  if (file.endsWith("AGENTS.md") && !file.startsWith(SKILLS_DIR)) continue;
  const vendored = isVendoredSkill(file);
  if (vendored && values["no-skills"]) continue;
  const source = join(template, file);
  if (!existsSync(source)) continue;
  const destination = join(target, file);
  mkdirSync(dirname(destination), { recursive: true });
  const buffer = readFileSync(source);
  // Vendored skills stay byte-identical so their lock hashes keep matching.
  if (vendored || buffer.includes(0)) {
    cpSync(source, destination);
    continue;
  }
  const text = buffer.toString("utf8");
  if (file.startsWith("recipes/") && !recipeFits(text)) continue;
  writeFileSync(destination, transform(text));
}
writeFileSync(
  join(target, "README.md"),
  `# ${title}\n\nStack, commands and conventions: [CLAUDE.md](CLAUDE.md).\n`
);

// 2. Local env: a fresh auth secret and a free Postgres port.
const port = await freePort();
const env = readFileSync(join(target, ".env.example"), "utf8")
  .replace(/^BETTER_AUTH_SECRET=.*$/m, `BETTER_AUTH_SECRET=${randomBytes(32).toString("base64")}`)
  .replace(/^POSTGRES_PORT=.*$/m, `POSTGRES_PORT=${port}`)
  .replace(/localhost:5432\//g, `localhost:${port}/`);
writeFileSync(join(target, ".env.local"), env);

// 3. Git, shape-only skills, dependencies, formatting and the first commit.
run(["git", "init", "-q"]);
const removeSkills = values["no-skills"] ? [] : SHAPES[shape].removeSkills;
if (removeSkills.length > 0) {
  run(["npx", "-y", SKILLS_CLI, "remove", ...removeSkills, "-y"]);
}
if (!values["no-install"]) run(["bun", "install"]);
if (!values["no-install"]) run(["bun", "run", "format"]);
run(["git", "add", "-A"]);
run(["git", "commit", "-q", "-m", `feat: scaffold ${name} from ai-stack (${shape})`], {
  HUSKY: "0",
});

console.log(
  `\nCreated ${target} (${shape}). Next: cd ${values.dir ?? name} && bun run db:up && bun run db:migrate && bun dev`
);
