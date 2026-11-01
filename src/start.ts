import { createStart } from "@tanstack/react-start";

import { logApiError, logRequest } from "#/lib/api/middleware";

export const startInstance = createStart(() => ({
	requestMiddleware: [logRequest, logApiError],
}));
