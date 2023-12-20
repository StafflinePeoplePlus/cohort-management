import type { CohortRole as DefaultCohortRole } from './schemaTypes.js';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	namespace CohortManagement {
		type CohortMemberMetadataInput = unknown;
		type CohortMemberMetadata = unknown;
		type CohortRole = DefaultCohortRole;
	}
}

export {};
