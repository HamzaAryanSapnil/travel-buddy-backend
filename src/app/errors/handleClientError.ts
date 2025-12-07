import { Prisma } from '@prisma/client';
import { TGenericErrorResponse } from '../interfaces/error';

const handleClientError = (
  error: Prisma.PrismaClientKnownRequestError
): TGenericErrorResponse => {
  let errors: {
    path: string | number;
    message: string;
  }[] = [];
  let message = '';
  const statusCode = 400;

  if (error.code === 'P2025') {
    message = (error.meta?.cause as string) || 'Record not found!';
    errors = [
      {
        path: '',
        message,
      },
    ];
  } else if (error.code === 'P2003') {
    if (error.message.includes('Foreign key constraint failed')) {
      message = 'Foreign key constraint failed';
      errors = [
        {
          path: '',
          message,
        },
      ];
    }
  } else if (error.code === 'P2002') {
    const target = error.meta?.target;
    message = 'Unique constraint error';
    errors = [
      {
        path: '',
        message: `${target} must be unique`,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorMessages: errors,
  };
};

export default handleClientError;

