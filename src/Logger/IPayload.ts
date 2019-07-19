/**
 * Named structured data payload that can be logged
 * along with the standard fields. The payload's name
 * will be used as an element key for structured
 * logging in order to avoid indexing conflicts with
 * different payloads that use the same keys.
 */
export interface IPayload {
    name: string;

    [data: string]: any
}
