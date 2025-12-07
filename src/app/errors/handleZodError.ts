import { ZodError, ZodIssue } from 'zod';
import { TGenericErrorResponse, TGenericErrorMessage } from '../interfaces/error';

const handleZodError = (error: ZodError): TGenericErrorResponse => {
  const errors: TGenericErrorMessage[] = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue.path[issue.path.length - 1] as string | number, // Type assertion added
      message: issue.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: errors,
  };
};

export default handleZodError;

