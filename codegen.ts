import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	overwrite: true,
	schema: ['./schema.graphql', './defaults.graphql'],
	generates: {
		'src/lib/server/graphql/generated.ts': {
			plugins: [
				{
					add: {
						content: `/* eslint-disable */`
					}
				},
				'typescript',
				'typescript-resolvers'
			],
			config: {
				useTypeImports: true,
				enumsAsTypes: true,
				scalars: {
					EmailAddress: 'string'
				}
			}
		}
	}
};

export default config;
