import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    overwrite: true,
    schema: ["./schema.graphql", "./defaults.graphql"],
    generates: {
        "src/graphql/generated.ts": {
            plugins: ["typescript", "typescript-resolvers"],
            config: {
                useTypeImports: true,
                enumsAsTypes: true,
                scalars: {
                    EmailAddress: "string",
                },
            },
        },
    },
};

export default config;
