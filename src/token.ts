import { Data, Jwt, Quiz, QuizSessionAdmin, States, Token } from '../interfaces/interfaces';
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

// Creates a new token given a userId
export const createToken = (userId: number): Token => {
  const sessionId: string = createSessionId();
  const token: Token = {
    sessionId: sessionId,
    userId: userId
  };

  return token;
};

// Converts a jwt string into a token
export const jwtToToken = (jwt: Jwt): Token => {
  const decode = jsonwebtoken.verify(jwt.token, SECRET_KEY) as JwtPayload;

  return {
    sessionId: decode.sessionId,
    userId: decode.userId
  };
};

// Encodes a token into a jwt string
export const tokenToJwt = (token: Token): Jwt => {
  return {
    token: jsonwebtoken.sign(token, SECRET_KEY) as string
  };
};

// Adds token to datastore that stores all current sessions
export const addTokenToSession = (newToken: Token): void => {
  const data = getData();

  // Don't create token if user already in a session
  if (data.session.find((token: Token) => token.userId === newToken.userId) !== undefined) return;

  data.session.push(newToken);

  setData(data);
};

// Gets token from sessions datastore from a userId. If not available, then creates a new one
export const getTokenLogin = (userId: number): Token => {
  const data = getData();
  let token = data.session.find((token: Token) => token.userId === userId);

  if (token === undefined) {
    token = createToken(userId);
  }

  return token;
};

export const objToJwt = (obj: object): Jwt => {
  return {
    token: jsonwebtoken.sign(obj, SECRET_KEY) as string
  };
};

export const checkJwtValid = (jwt: Jwt) => {
  let output;

  try {
    const decode = jsonwebtoken.verify(jwt.token, SECRET_KEY) as JwtPayload;

    if ('sessionId' in decode && 'userId' in decode && Object.keys(decode).length === 3) {
      output = {
        valid: true,
        token: {
          sessionId: decode.sessionId,
          userId: decode.userId
        }
      };
    } else {
      output = {
        valid: false
      };
    }
  } catch {
    output = {
      valid: false
    };
  }

  return output;
};

export const createQuizSession = (authUserId: number, quizId: number, autoStartNum: number): QuizSessionAdmin => {
  const sessionId: number = parseInt(createSessionId());

  const data = getData();

  const quiz: Quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);

  const quizSession: QuizSessionAdmin = {
    sessionId: sessionId,
    authUserId: authUserId,
    playerInfo: [],
    autoStartNum: autoStartNum,
    countdownTimer: undefined, // Timer for countdown
    questionTimer: undefined, // Timer for question countdown
    state: States.LOBBY,
    atQuestion: 0,
    playerAnswers: [],
    questionOpenTime: 0,
    players: [],
    metadata: {
      imgUrl: 'Some thumbnail url.com.au',
      ...quiz
    }, // todo: Add thumbnail to whoever doing it.
    messages: []
  };

  return quizSession;
};
