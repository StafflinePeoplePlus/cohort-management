import { readFile, writeFile } from 'node:fs/promises';

const schema = await readFile('schema.graphql', 'utf8');
const exportFile = `export default \`${schema}\`;`;
await writeFile('./src/graphql/schema.ts', exportFile, 'utf8');
