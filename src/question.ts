import { ErrorAndStatusCode, Jwt, QuestionBody, QuizQuestionCreate, Token, Question, Quiz, OkObj, AdminQuestionDuplicate } from '../interfaces/interfaces';
import {
  checkAnswerHasTrueValue, checkAnswerLengthValid, checkQuestionAnswerNonDuplicate, checkQuizAndUserIdValid, checkQuizIdValid,
  checkTokenValidSession, checkTokenValidStructure, createQuestionId, getTotalDuration, checkQuestionIdIsValidInQuiz, checkQuestionIdValid
} from './helper';
import { jwtToToken } from './token';
import { getData, setData } from './dataStore';

export function quizCreateQuestion(jwt: Jwt, questionBody: QuestionBody, quizId: number): QuizQuestionCreate | ErrorAndStatusCode {
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }

  const token: Token = jwtToToken(jwt);
  const authUserId: number = token.userId;
  const data = getData();
  const quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);

  if (!checkQuizIdValid(quizId)) {
    return {
      error: 'Quiz ID does not refer to a valid quiz',
      statusCode: 400
    };
  }

  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      statusCode: 400
    };
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    return {
      error: 'Question string is less than 5 characters in length or greater than 50 characters in length',
      statusCode: 400
    };
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return {
      error: 'The question has more than 6 answers or less than 2 answers',
      statusCode: 400
    };
  }

  if (questionBody.duration <= 0) {
    return {
      error: 'The question duration is not a positive number',
      statusCode: 400
    };
  }

  if (getTotalDuration(quiz) + questionBody.duration > 180) {
    return {
      error: 'The sum of the question durations in the quiz exceeds 3 minutes',
      statusCode: 400
    };
  }

  if (questionBody.points < 1 || questionBody.points > 10) {
    return {
      error: 'The points awarded for the question are less than 1 or greater than 10',
      statusCode: 400
    };
  }

  if (!checkAnswerLengthValid(questionBody.answers)) {
    return {
      error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long',
      statusCode: 400
    };
  }

  if (!checkQuestionAnswerNonDuplicate(questionBody.answers)) {
    return {
      error: 'Any answer strings are duplicates of one another (within the same question)',
      statusCode: 400
    };
  }

  if (!checkAnswerHasTrueValue(questionBody.answers)) {
    return {
      error: 'There are no correct answers',
      statusCode: 400
    };
  }

  const questionId: number = createQuestionId(quiz);

  quiz.questions.push({
    questionId: questionId,
    ...questionBody
  });

  setData(data);

  return {
    questionId: questionId
  };
}

export function quizDuplicateQuestion(jwt: Jwt, quizId: number, questionId: number): AdminQuestionDuplicate | ErrorAndStatusCode {
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }

  const token: Token = jwtToToken(jwt);
  const authUserId: number = token.userId;
  const data = getData();
  const quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);

  if (!checkQuizIdValid(quizId)) {
    return {
      error: 'Quiz ID does not refer to a valid quiz',
      statusCode: 400
    };
  }

  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      statusCode: 400
    };
  }

  if (!checkQuestionIdIsValidInQuiz(quiz.questions, questionId)) {
    return {
      error: 'Question Id does not refer to a valid question within this quiz',
      statusCode: 400
    };
  }

  // if successful
  const qId = quiz.questions.findIndex(({ questionId: id }) => id === questionId);
  const result = quiz.questions.find(({ questionId: id }) => id === questionId) as Question;

  if (result) {
    const newQuestionId = createQuestionId(quiz);
    const duplicatedQuestion = { ...result, questionId: newQuestionId };
    quiz.questions.splice(qId + 1, 0, duplicatedQuestion);
  }

  // updates the time edited
  for (const q of data.quizzes) {
    if (q.quizId === quizId) {
      q.timeLastEdited = Math.round(Date.now() / 1000);
    }
  }
  const newQuestion: AdminQuestionDuplicate = {
    newQuestionId: newQuestionId
  };

  setData(data);
  return newQuestion;
}

/**
 * Deletes a quiz question
 *
 * @param {number} quizId - The unique id of the quiz
 * @param {number} questionId - The unique id of the quiz question
 * @param {Jwt} jwt - Jwt token containing sessionId and userId
*/

export function adminQuizDelete(jwt: Jwt, quizId: number, questionId: number): OkObj | ErrorAndStatusCode {
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }

  // QuizId does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    return {
      error: 'Quiz ID does not refer to a valid quiz',
      statusCode: 400
    };
  }

  // QuizId does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, jwtToToken(jwt).userId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      statusCode: 400
    };
  }

  const data = getData();
  const quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);
  // QuestionId does not refer to a valid question within this quiz
  if (!checkQuestionIdValid(questionId, quiz)) {
    return {
      error: 'Quiz ID does not refer to a valid question within this quiz',
      statusCode: 400
    };
  }

  const quizIndex: number = data.quizzes.indexOf(quiz);
  let questionIndex: number;
  for (const question of data.quizzes[quizIndex].questions) {
    if (question.questionId === questionId) {
      questionIndex = data.quizzes[quizIndex].questions.indexOf(question);
    }
  }

  if (questionIndex !== -1) {
    data.quizzes[quizIndex].questions.splice(questionIndex, 1);
    setData(data);
    return {};
  }
}

export function quizUpdateQuestion(jwt: Jwt, questionBody: QuestionBody, quizId: number, questionId: number): OkObj | ErrorAndStatusCode {
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }

  const data = getData();
  const token: Token = jwtToToken(jwt);
  const authUserId: number = token.userId;
  const quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);
  if (!checkQuizIdValid(quizId)) {
    return {
      error: 'Quiz ID does not refer to a valid quiz',
      statusCode: 400
    };
  }

  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      statusCode: 400
    };
  }

  if (!checkQuestionIdIsValidInQuiz(quiz.questions, questionId)) {
    return {
      error: 'Question Id does not refer to a valid question within this quiz',
      statusCode: 400
    };
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    return {
      error: 'Question string is less than 5 characters in length or greater than 50 characters in length',
      statusCode: 400
    };
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return {
      error: 'The question has more than 6 answers or less than 2 answers',
      statusCode: 400
    };
  }

  if (questionBody.duration <= 0) {
    return {
      error: 'The question duration is not a positive number',
      statusCode: 400
    };
  }

  if (getTotalDuration(quiz) + questionBody.duration > 180) {
    return {
      error: 'The sum of the question durations in the quiz exceeds 3 minutes',
      statusCode: 400
    };
  }

  if (questionBody.points < 1 || questionBody.points > 10) {
    return {
      error: 'The points awarded for the question are less than 1 or greater than 10',
      statusCode: 400
    };
  }

  if (!checkAnswerLengthValid(questionBody.answers)) {
    return {
      error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long',
      statusCode: 400
    };
  }

  if (!checkQuestionAnswerNonDuplicate(questionBody.answers)) {
    return {
      error: 'Any answer strings are duplicates of one another (within the same question)',
      statusCode: 400
    };
  }

  if (!checkAnswerHasTrueValue(questionBody.answers)) {
    return {
      error: 'There are no correct answers',
      statusCode: 400
    };
  }

  // if sucessful
  const updateQ = quiz.questions.find(({ questionId: id }) => id === questionId) as Question;
  updateQ.question = questionBody.question;
  updateQ.duration = questionBody.duration;
  updateQ.points = questionBody.points;
  updateQ.answers = questionBody.answers;

  // updates the time edited
  for (const q of data.quizzes) {
    if (q.quizId === quizId) {
      q.timeLastEdited = Math.round(Date.now() / 1000);
    }
  }

  setData(data);
  return {};
}

/**
 * This function moves a question from one particular position in the quiz to another,
 * timeLastEdited is updated
 * @param {number} quizId - unique quizId
 * @param {number} questionId - unique questionId in quiz
 * @param {number} newPosition - new position where element will be moved
 * @param {Jwt} jwt - Jwt token containing sessionId and user Id
 */
export function quizMoveQuestion(quizId: number, questionId: number, newPosition: number, jwt: Jwt): OkObj | ErrorAndStatusCode {
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }

  // QuizId does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    return {
      error: 'Quiz ID does not refer to a valid quiz',
      statusCode: 400
    };
  }

  // QuizId does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, jwtToToken(jwt).userId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      statusCode: 400
    };
  }

  const data = getData();
  const quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);

  // QuestionId does not refer to a valid question within this quiz
  if (!checkQuestionIdValid(questionId, quiz)) {
    return {
      error: 'Quiz ID does not refer to a valid question within this quiz',
      statusCode: 400
    };
  }

  // newPosition is less than 0 or newPosition is greater than n-1 where n is the number of questions
  if (newPosition < 0 || newPosition > quiz.questions.length) {
    return {
      error: 'New Position is less than 0 or New Position is greater than the number of questions',
      statusCode: 400
    };
  }

  // obtaining question index according to questionId
  const quizIndex: number = data.quizzes.indexOf(quiz);
  let questionIndex: number;
  let movedQuestion: Question;
  for (const question of data.quizzes[quizIndex].questions) {
    if (question.questionId === questionId) {
      questionIndex = data.quizzes[quizIndex].questions.indexOf(question);
      movedQuestion = question;
    }
  }

  // newPosition is the position of the current question
  if (newPosition === questionIndex) {
    return {
      error: 'New Position is the position of the current question',
      statusCode: 400
    };
  }

  // removing original question from position
  data.quizzes[quizIndex].questions.splice(questionIndex, 1);
  // putting original question to new position
  data.quizzes[quizIndex].questions.splice(newPosition, 0, movedQuestion);
  data.quizzes[quizIndex].timeLastEdited = Math.round(Date.now() / 1000);
  setData(data);
  return {};
}
