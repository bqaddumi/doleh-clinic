import dayjs from 'dayjs';

export const formatDate = (value?: string | null) => {
  if (!value) {
    return 'N/A';
  }

  return dayjs(value).format('DD MMM YYYY');
};

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'N/A';
  }

  return dayjs(value).format('DD MMM YYYY, HH:mm');
};

export const getErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
};
