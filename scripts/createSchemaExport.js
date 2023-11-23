import { readFile, writeFile } from 'node:fs/promises';

const schema = await readFile('schema.graphql', 'utf8');
const defaults = await readFile('defaults.graphql', 'utf8');
const exportFile = `export default \`${schema}\`;\n\nexport const defaults = \`${defaults}\`;\n`;
await writeFile('./src/lib/server/graphql/schema.ts', exportFile, 'utf8');
