import { createStart } from "@tanstack/react-start";

import { logApiError } from "#/lib/api/middleware";

export const startInstance = createStart(() => ({
	requestMiddleware: [logApiError],
}));
