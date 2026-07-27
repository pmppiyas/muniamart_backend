import httpStatus from 'http-status-codes';

interface errType {
  path: string;
  message: string;
}

export let errorSources: errType[] = [];
let errMode: any[] = [];
let missing: string[] = [];

const resetState = () => {
  errorSources = [];
  errMode = [];
  missing = [];
};

export const handleDuplicateError = (error: any) => {
  resetState();

  const keyValue = error.keyValue;
  if (keyValue) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return {
      message: `Duplicate ${field} "${value}" already exists`,
      statusCode: httpStatus.METHOD_FAILURE,
    };
  }

  return {
    message: 'Duplicate value already exists',
    statusCode: httpStatus.METHOD_FAILURE,
  };
};

export const handleZodValidatonError = (error: any) => {
  const issues = error.issues ?? [];

  const errorSources = issues.map((issue: any) => {
    const field = issue.path.join('.');

    const capitalize = (text: string) =>
      text.charAt(0).toUpperCase() + text.slice(1);

    const fieldName = capitalize(field);

    let message = issue.message;

    if (issue.code === 'invalid_type') {
      if (issue.expected === 'string') {
        message = `${fieldName} must be a string`;
      } else if (issue.expected === 'number') {
        message = `${fieldName} must be a number`;
      } else {
        message = `${fieldName} has invalid type`;
      }
    }

    return {
      path: field,
      message,
    };
  });

  return {
    statusCode: 400,
    message: errorSources[0]?.message || 'Validation failed',
    errorSources,
  };
};

export const validationError = (error: any) => {
  resetState();

  const errors = Object.values(error.errors);
  errors.forEach((errObj: any) =>
    errorSources.push({ path: errObj.path, message: errObj.message })
  );

  return {
    message: `Something’s wrong with ${error.name}`,
    statusCode: httpStatus.BAD_REQUEST,
  };
};

export const prismaError = (err: any) => {
  if (err.code === 'P2025') {
    return {
      statusCode: httpStatus.NOT_FOUND,
      message: `${err.meta?.modelName || 'Record'} not found.`,
    };
  }

  if (err.code === 'P2002') {
    return {
      statusCode: httpStatus.CONFLICT,
      message: `A record with the same ${err.meta?.target?.join(', ')} already exists.`,
    };
  }

  return {
    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
    message: err.message || 'An unexpected Prisma error occurred.',
  };
};
