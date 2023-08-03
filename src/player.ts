import { Token, QuizSession, QuestionAnswer, Answer, QuizSessionAdmin, Question, OkObj, States, QuestionCorrectBreakdown, getQuestionResultsReturn, PlayerAnswer } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import { getLetter, getNumber, hasDuplicates, isAnswersCorrect, getQuestionCorrectBreakdown, questionAverageAnswerTime, questionPercentageCorrect } from './helper';
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
  if (thisSession.atQuestion !== questionPosition && thisSession.atQuestion !== 0) {
    throw HTTPError(400, 'Session is not currently on this question');
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
  // if questionPostion is spot in quiz then index is questionPosition-1
  const qP: number = questionPosition - 1;
  const questionId: number = quiz.questions[qP].questionId;
  const question: string = quiz.questions[qP].question;
  const duration: number = quiz.questions[qP].duration;
  const points: number = quiz.questions[qP].points;
  const fullAnswers: Answer[] = quiz.questions[qP].answers;
  const answers: QuestionAnswer[] = fullAnswers.map(({ answerId, answer, colour }) => ({ answerId, answer, colour }));
  const thumbnailUrl = quiz.questions[qP].thumbnailUrl;

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
export function playerSubmitAnswer(answerIds: Array<number>, playerId: number, questionPosition: number): OkObj {
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
  const quiz = data.quizzes.find((quiz) => quiz.adminQuizId === thisSession.authUserId);

  if (quiz.numQuestions < questionPosition) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }

  if (thisSession.atQuestion !== questionPosition && thisSession.atQuestion !== 0) {
    throw HTTPError(400, 'Session is not yet currently up to this question');
  }

  if (answerIds.length === 0) {
    throw HTTPError(400, 'Less than 1 answer ID was submitted');
  }
  if (thisSession.state !== States.QUESTION_OPEN) {
    throw HTTPError(400, 'The question is not open for answers');
  }
  const sessionIndex: number = data.quizSessions.indexOf(thisSession);
  const questionAnswers: Answer[] = data.quizSessions[sessionIndex].metadata.questions[questionPosition - 1].answers;
  const question: Question = data.quizSessions[sessionIndex].metadata.questions[questionPosition - 1];
  const playerName: string = data.quizSessions[sessionIndex].playerInfo.find((info) => info.playerId === playerId).name;
  const answerIdsArraySet: Set<number> = new Set(questionAnswers.map(answer => answer.answerId));
  if (!(answerIds.every((num: number) => answerIdsArraySet.has(num)))) {
    throw HTTPError(400, 'Answer IDs are not valid for this particular question');
  }

  if (hasDuplicates(answerIds) === true) {
    throw HTTPError(400, 'Duplicate Answers not allowed');
  }

  // Check if the player has already submitted an answer for this question
  const existingPlayerAnswerIndex = thisSession.playerAnswers.findIndex(
    (answer) => answer.playerId === playerId && answer.questionId === question.questionId
  );

  // get opening time of question
  const questionOpenTime: number = data.quizSessions[sessionIndex].questionOpenTime;

  // Record the time of submission
  const submissionTime = Math.round(Date.now() / 1000) - questionOpenTime;

  const correctAnswerIds = question.answers
    .filter((answer) => answer.correct)
    .map((answer) => answer.answerId);

  const isCorrect: boolean = isAnswersCorrect(correctAnswerIds, answerIds);

  if (existingPlayerAnswerIndex !== -1) {
    // Player has already submitted an answer for this question, update the existing answer
    thisSession.playerAnswers[existingPlayerAnswerIndex].answerIds = answerIds;
    thisSession.playerAnswers[existingPlayerAnswerIndex].submissionTime = submissionTime;
    thisSession.playerAnswers[existingPlayerAnswerIndex].isCorrect = isCorrect;
    setData(data);
  } else {
    // Player is submitting a new answer for this question
    // Add the new player's answer to the session
    thisSession.playerAnswers.push({
      playerId: playerId,
      name: playerName,
      questionId: question.questionId,
      answerIds: answerIds,
      submissionTime: submissionTime,
      isCorrect: isCorrect,
    });

    setData(data);
  }
  return {};
}

export function getQuestionResults(playerId: number, questionPosition: number): getQuestionResultsReturn {
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
  const quiz = data.quizzes.find((quiz) => quiz.adminQuizId === thisSession.authUserId);
  if (thisSession.state !== States.ANSWER_SHOW) {
    throw HTTPError(400, 'The question is not open for results');
  }

  if (quiz.numQuestions < questionPosition) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }

  if (thisSession.atQuestion < questionPosition && thisSession.atQuestion !== 0) {
    throw HTTPError(400, 'Session is not yet currently up to this question');
  }

  const sessionIndex: number = data.quizSessions.indexOf(thisSession);
  const question: Question = data.quizSessions[sessionIndex].metadata.questions[questionPosition - 1];
  const playerAnswer: PlayerAnswer[] = data.quizSessions[sessionIndex].playerAnswers;

  const correctAnswerIds = question.answers
    .filter((answer) => answer.correct)
    .map((answer) => answer.answerId);
  // Create questionCorrectBreakdown array
  const questionCorrectBreakdown: QuestionCorrectBreakdown[] = getQuestionCorrectBreakdown(playerAnswer, question.questionId, correctAnswerIds);

  // Average answer time
  const averageAnswerTime: number = questionAverageAnswerTime(playerAnswer, question.questionId);

  const percentCorrect: number = questionPercentageCorrect(playerAnswer, question.questionId);

  return {
    questionId: question.questionId,
    questionCorrectBreakdown: questionCorrectBreakdown,
    averageAnswerTime: averageAnswerTime,
    percentCorrect: percentCorrect
  };
}

/**
  * Get player status
  *
  * @param {number} playerId
  *
  * @returns {{state, numQuestions, atQuestion} | {error: string}}
*/
export function getPlayerStatus (playerId: number) {
  const data = getData();
  const found = data.quizSessions.find((session) => session.playerInfo.find((player) => player.playerId === playerId));
  if (!found) {
    throw HTTPError(400, 'Player Id does not exit');
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
  const quizId = quiz.quizId;
  const token: Token = {
    sessionId: thisSession.sessionId.toString(),
    userId: authUserId
  };
  const jwt = tokenToJwt(token);
  const status = getSessionStatus(quizId, thisSession.sessionId, jwt) as QuizSession;

  return {
    state: status.state,
    numQuestions: quiz.numQuestions,
    atQuestion: thisSession.atQuestion,
  };
}
