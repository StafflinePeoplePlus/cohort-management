import { resolvers } from './resolvers.js';
import typeDefs from './schema.js';
import type { CohortRole as DefaultCohortRole } from './schemaTypes.js';

export default { typeDefs, resolvers };

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace CohortManagement {
		type CohortMemberMetadataInput = unknown;
		type CohortMemberMetadata = unknown;
		type CohortRole = DefaultCohortRole;
	}
}
