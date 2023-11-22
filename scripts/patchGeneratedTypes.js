import { readFile, writeFile } from 'node:fs/promises';

const userDefinedTypes = ['CohortMemberMetadataInput'];
const typesRegex = /export type (\w+) = {.+?\n};/gs;

const generatedFile = await readFile('./src/graphql/generated.ts', 'utf-8');

const patchedFile = generatedFile.replace(typesRegex, (match, type) => {
	if (userDefinedTypes.includes(type)) {
		return `export type ${type} = CohortManagement.${type};`;
	}
	return match;
});
await writeFile('./src/graphql/generated.ts', patchedFile, 'utf-8');
