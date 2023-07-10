import { Token } from '../../interfaces/interfaces';

export const checkTokenValid = (token: Token, authUserId: number): boolean => {
  if (parseInt(token.sessionId) < 0 || parseInt(token.sessionId) > 10e6 || token.userId !== authUserId) return false;
  return true;
};