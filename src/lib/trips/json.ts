/*
minimal json value union used as the b2 i/o boundary: payloads enter as
JsonValue and become domain types only through predicates in ./types.
*/

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };
