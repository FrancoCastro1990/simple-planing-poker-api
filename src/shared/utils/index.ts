export const generateRoomId = (length: number = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const isValidRoomId = (id: string, expectedLength: number = 6): boolean => {
  return typeof id === 'string' && id.length === expectedLength && /^[A-Za-z]+$/.test(id);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatError = (error: unknown): { message: string; code?: string } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name,
    };
  }
  
  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

export const sanitizeRoomTitle = (title: string | undefined): string | undefined => {
  if (!title) return undefined;
  return title.trim().slice(0, 100) || undefined;
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};