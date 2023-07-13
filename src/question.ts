import { ErrorAndStatusCode, Jwt, QuestionBody, QuizQuestionCreate, Token, Quiz, OkObj } from '../interfaces/interfaces';
import { getData } from './dataStore';
import {
  checkAnswerHasTrueValue, checkAnswerLengthValid, checkQuestionAnswerNonDuplicate, checkQuizAndUserIdValid, checkQuizIdValid,
  checkTokenValidSession, checkTokenValidStructure, createQuestionId, getQuiz, getTotalDuration, checkQuestionIdValid
} from './helper';
import { jwtToToken } from './token';

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
  const quiz: Quiz = getQuiz(quizId);

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

  // console.log('Hi');
  // console.log(getTotalDuration);
  // console.log(questionBody.duration);

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

  return {
    questionId: questionId
  };
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

  const quiz: Quiz = getQuiz(quizId);
  // QuestionId does not refer to a valid question within this quiz
  if (!checkQuestionIdValid(questionId, quiz)) {
    return {
      error: 'Quiz ID does not refer to a valid question within this quiz',
      statusCode: 400
    };
  }

  const data = getData().quizzes;
  const quizIndex: number = data.indexOf(quiz);
  let questionIndex: number;
  for (const question of data[quizIndex].questions) {
    if (question.questionId === questionId) {
      questionIndex = data[quizIndex].questions.indexOf(question);
    }
  }

  if (questionIndex !== -1) {
    data[quizIndex].questions.splice(questionIndex, 1);
    return {};
  }
}
