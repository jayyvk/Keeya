
/**
 * Utility to generate random words for filenames and other purposes
 */
const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

export const generateRandomWord = (length: number = 10): string => {
  return Array.from({ length }, () => 
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
};

// Also export a function to generate a unique filename
export const generateUniqueFilename = (extension: string = 'mp3'): string => {
  const timestamp = Date.now();
  const random = generateRandomWord(6);
  return `${timestamp}-${random}.${extension}`;
};
