import { readFile, writeFile } from 'node:fs/promises';

const userDefinedTypes = ['CohortMemberMetadataInput', 'CohortMemberMetadata'];
const typesRegex = /export type (\w+) = {.+?\n};/gs;

const schemaTypesFile = await readFile('./src/lib/server/graphql/schemaTypes.d.ts', 'utf-8');

const patchedFile = schemaTypesFile.replace(typesRegex, (match, type) => {
	if (userDefinedTypes.includes(type)) {
		return `export type ${type} = CohortManagement.${type};`;
	}
	return match;
});
await writeFile('./src/lib/server/graphql/schemaTypes.d.ts', patchedFile, 'utf-8');
