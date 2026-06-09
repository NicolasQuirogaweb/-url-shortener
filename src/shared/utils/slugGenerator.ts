import { nanoid } from 'nanoid';

const DEFAULT_LENGTH = 8;

export const generateSlug = (length = DEFAULT_LENGTH): string => {
  return nanoid(length);
};
