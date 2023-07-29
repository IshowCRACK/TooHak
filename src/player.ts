import { Token, QuizSession } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import { getLetter, getNumber } from './helper';
import { tokenToJwt } from './token';
import HTTPError from 'http-errors';
import { getSessionStatus } from './quiz';

export function playerJoin(sessionId: number, name: string) {
  const data = getData();

  // not unique name
  const session = data.quizSessions.find((session) => session.sessionId === sessionId);
  if (session) {
    if (session.players.find((player) => player === name)) {
      throw HTTPError(400, 'Name of user entered is not unique');
    }
  }

  const quiz = data.quizzes.find((quiz) => quiz.adminQuizId === session.authUserId);
  const authUserId = quiz.adminQuizId;
  const quizId = quiz.quizId;
  const token: Token = {
    sessionId: sessionId.toString(),
    userId: authUserId
  };
  const jwt = tokenToJwt(token);
  const status = getSessionStatus(quizId, sessionId, jwt) as QuizSession;
  if (status.state !== 'LOBBY') {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }

  if (name === '') {
    const letters = getLetter();
    const numbers = getNumber();
    name = letters + numbers;
    console.log(name);
  }

  const playerId = session.maxPlayerId + 1;

  const object = {
    playerId: playerId,
  };
  console.log(object);
  session.players.push(name);
  session.maxPlayerId++;
  setData(data);

  return object;
}
