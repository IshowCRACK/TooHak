import { Token, QuizSession, QuestionAnswer, Answer, QuizSessionAdmin } from '../interfaces/interfaces';
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

  const playerId = data.maxPlayerId + 1;

  const playerInfo = {
    playerId: playerId,
    name: name,
  };

  session.playerInfo.push(playerInfo);
  session.players.push(name);
  data.maxPlayerId++;
  setData(data);

  return { playerId: playerId };
}

export function playerQuestionInfo(playerId: number, questionPosition: number) {
  const data = getData();
  // no playerId
  if (playerId > data.maxPlayerId || playerId <= 0) {
    throw HTTPError(400, 'player ID does not exist');
  }

  // find session
  let thisSession: QuizSessionAdmin;
  for (const session of data.quizSessions) {
    const playerInfo = session.playerInfo;
    for (const player of playerInfo) {
      if (player.playerId === playerId) {
        thisSession = session;
      }
    }
  }

  // find numQuestions by finding authuserId
  const authUserId = thisSession.authUserId;
  const quiz = data.quizzes.find((quiz) => quiz.adminQuizId === thisSession.authUserId);

  if (quiz.numQuestions < questionPosition) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }
  if (thisSession.atQuestion !== questionPosition) {
    throw HTTPError(400, 'If session is not currently on this question');
  }
  const quizId = quiz.quizId;
  const token: Token = {
    sessionId: thisSession.sessionId.toString(),
    userId: authUserId
  };
  const jwt = tokenToJwt(token);
  const status = getSessionStatus(quizId, thisSession.sessionId, jwt) as QuizSession;

  if (status.state === 'LOBBY' || status.state === 'END') {
    throw HTTPError(400, 'Session is in LOBBY or END state');
  }
  const questionId: number = quiz.questions[questionPosition].questionId;
  const question: string = quiz.questions[questionPosition].question;
  const duration: number = quiz.questions[questionPosition].duration;
  const points: number = quiz.questions[questionPosition].points;
  const fullAnswers: Answer[] = quiz.questions[questionPosition].answers;
  const answers: QuestionAnswer[] = fullAnswers.map(({ answerId, answer, colour }) => ({ answerId, answer, colour }));
  const thumbnailUrl = quiz.questions[questionPosition].thumbnailUrl;

  const questionInfoReturn = {
    questionId,
    question,
    duration,
    thumbnailUrl,
    points,
    answers,
  };

  return questionInfoReturn;
}
