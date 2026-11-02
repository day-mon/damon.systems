/*
entry point for the better-auth CLI (migrate/generate). real runtime code
goes through getAuth() so client bundles never eagerly touch pg.
*/

import { getAuth } from "./better";

export const auth = getAuth();
