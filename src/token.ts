import { Data, ErrorObj, Jwt, Token } from '../interfaces/interfaces';
import { getData } from './dataStore';

// Maximum number of users logged in at once
const totalActiveUsers = 10e6;

const createSessionId = (): string => {
  const data: Data = getData();

  let possibleSessionId: string = (Math.random() * totalActiveUsers).toString();

  while (data.session.find((token: Token) => token.sessionId === possibleSessionId) !== undefined) {
    possibleSessionId = (Math.random() * totalActiveUsers).toString();
  }

  return possibleSessionId;
};

export const createToken = (userId: number) => {
  const sessionId: string = createSessionId();
  const token: Token = {
    sessionId: sessionId,
    userId: userId
  };

  return token;
};

export const jwtToToken = (jwt: Jwt): Token => {
  const data = getData();

  return data.session.find((token: Token) => token.sessionId === jwt);
};

export const tokenToJwt = (token: Token): Jwt => {
  return token.sessionId;
};
