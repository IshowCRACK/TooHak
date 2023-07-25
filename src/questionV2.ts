import { ErrorAndStatusCode, Jwt, QuestionBody, Token, Quiz, OkObj, Question } from '../interfaces/interfaces';
import {
  checkAnswerHasTrueValue, checkAnswerLengthValid, checkQuestionAnswerNonDuplicate, checkQuizAndUserIdValid, checkQuizIdValid,
  checkTokenValidSession, checkTokenValidStructure, createQuestionId, getTotalDuration, checkQuestionIdValid, checkQuestionIdIsValidInQuiz
} from './helper';
import { jwtToToken } from './token';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import isURL from 'is-url';

export function quizCreateQuestionV2(jwt: Jwt, questionBody: QuestionBody, quizId: number) {
  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }

  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  const token: Token = jwtToToken(jwt);
  const authUserId: number = token.userId;
  const data = getData();
  const quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);

  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw HTTPError(400, 'Question string is less than 5 characters in length or greater than 50 characters in length');
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw HTTPError(400, 'The question has more than 6 answers or less than 2 answers');
  }

  if (questionBody.duration <= 0) {
    throw HTTPError(400, 'The question duration is not a positive number');
  }

  if (getTotalDuration(quiz) + questionBody.duration > 180) {
    throw HTTPError(400, 'The sum of the question durations in the quiz exceeds 3 minutes');
  }

  if (questionBody.points < 1 || questionBody.points > 10) {
    throw HTTPError(400, 'The points awarded for the question are less than 1 or greater than 10');
  }

  if (!checkAnswerLengthValid(questionBody.answers)) {
    throw HTTPError(400, 'The length of any answer is shorter than 1 character long, or longer than 30 characters long');
  }

  if (!checkQuestionAnswerNonDuplicate(questionBody.answers)) {
    throw HTTPError(400, 'Any answer strings are duplicates of one another (within the same question)');
  }

  if (!checkAnswerHasTrueValue(questionBody.answers)) {
    throw HTTPError(400, 'There are no correct answers');
  }

  if (!questionBody.thumbnailUrl || questionBody.thumbnailUrl === '') {
    throw HTTPError(400, 'Must have thumbnail');
  }
  if (!(/\.jpg$/.test(questionBody.thumbnailUrl) || /\.png$/.test(questionBody.thumbnailUrl))) {
    throw HTTPError(400, 'File is not a png or jpg file');
  }

  if (!isURL(questionBody.thumbnailUrl)) {
    throw HTTPError(400, 'Invalid URL');
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

export function quizUpdateQuestionV2(jwt: Jwt, questionBody: QuestionBody, quizId: number, questionId: number): OkObj | ErrorAndStatusCode {
  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }

  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  const data = getData();
  const token: Token = jwtToToken(jwt);
  const authUserId: number = token.userId;
  const quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);
  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  if (!checkQuestionIdIsValidInQuiz(quiz.questions, questionId)) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw HTTPError(400, 'Question string is less than 5 characters in length or greater than 50 characters in length');
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw HTTPError(400, 'The question has more than 6 answers or less than 2 answers');
  }

  if (questionBody.duration <= 0) {
    throw HTTPError(400, 'The question duration is not a positive number');
  }

  if (getTotalDuration(quiz) + questionBody.duration > 180) {
    throw HTTPError(400, 'The sum of the question durations in the quiz exceeds 3 minutes');
  }

  if (questionBody.points < 1 || questionBody.points > 10) {
    throw HTTPError(400, 'The points awarded for the question are less than 1 or greater than 10');
  }

  if (!checkAnswerLengthValid(questionBody.answers)) {
    throw HTTPError(400, 'The length of any answer is shorter than 1 character long, or longer than 30 characters long');
  }

  if (!checkQuestionAnswerNonDuplicate(questionBody.answers)) {
    throw HTTPError(400, 'Any answer strings are duplicates of one another (within the same question)');
  }

  if (!checkAnswerHasTrueValue(questionBody.answers)) {
    throw HTTPError(400, 'There are no correct answers');
  }

  if (!questionBody.thumbnailUrl || questionBody.thumbnailUrl === '') {
    throw HTTPError(400, 'Must have thumbnail');
  }
  if (!(/\.jpg$/.test(questionBody.thumbnailUrl) || /\.png$/.test(questionBody.thumbnailUrl))) {
    throw HTTPError(400, 'File is not a png or jpg file');
  }

  if (!isURL(questionBody.thumbnailUrl)) {
    throw HTTPError(400, 'Invalid URL');
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
 * Deletes a quiz question
 *
 * @param {number} quizId - The unique id of the quiz
 * @param {number} questionId - The unique id of the quiz question
 * @param {Jwt} jwt - Jwt token containing sessionId and userId
*/

export function deleteQuestionV2(jwt: Jwt, quizId: number, questionId: number): OkObj | ErrorAndStatusCode {
  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }

  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  // QuizId does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  // QuizId does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, jwtToToken(jwt).userId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const data = getData();
  const quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);
  // QuestionId does not refer to a valid question within this quiz
  if (!checkQuestionIdValid(questionId, quiz)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid question within this quiz');
  }

  /*

                NEED TO IMPLEMENT: All sessions for this quiz must be in END state ,

        USE THE GET SESSION STATUS FUNCTION TO ERROR CHECK WHEN WE FINSIH THAT FUNCTION

        */

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
