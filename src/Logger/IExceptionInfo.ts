/**
 * Encapsulates exception information.
 */
export interface IExceptionInfo {
    errorMessage?: string;
    errorData?: any;
    exceptionType: string;
    stackTrace: string;
}
