
const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

export const generateRandomWord = (length: number = 10): string => {
  return Array.from({ length }, () => 
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
};
