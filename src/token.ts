import { Data, ErrorObj, Jwt, Token } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';

// Maximum number of users logged in at once
const totalActiveUsers = 10e6;

const SECRET_KEY = 'secret';

const createSessionId = (): string => {
  const data: Data = getData();

  let possibleSessionId: string = Math.round((Math.random() * totalActiveUsers)).toString();

  while (data.session.find((token: Token) => token.sessionId === possibleSessionId) !== undefined) {
    possibleSessionId = Math.round((Math.random() * totalActiveUsers)).toString();
  }

  return possibleSessionId;
};

export const createToken = (userId: number): Token => {
  const sessionId: string = createSessionId();
  const token: Token = {
    sessionId: sessionId,
    userId: userId
  };

  return token;
};

export const jwtToToken = (jwt: Jwt): Token => {
  const decode = jsonwebtoken.verify(jwt.token, SECRET_KEY) as JwtPayload;

  return {
    sessionId: decode.sessionId,
    userId: decode.userId
  }
};

export const tokenToJwt = (token: Token): Jwt => {
  return {
    token: jsonwebtoken.sign(token, SECRET_KEY) as string
  }
}

export const addTokenToSession = (token: Token): void => {
  const data = getData();

  data.session.push(token);

  setData(data);
}

