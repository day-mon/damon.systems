/*
entry point for the better-auth CLI (migrate/generate). real runtime code
goes through the service so client bundles never eagerly touch pg.
*/

import { authz } from "./service";

export const auth = authz.betterAuth;
