import { ErrorAndStatusCode, Jwt, QuestionBody, QuizQuestionCreate, Token } from '../interfaces/interfaces';
import { checkAnswerHasTrueValue, checkAnswerLengthValid, checkQuestionAnswerNonDuplicate, checkQuizAndUserIdValid, checkQuizIdValid, checkTokenValidSession, checkTokenValidStructure, createQuestionId, getQuiz, getTotalDuration } from './helper';
import { jwtToToken } from './token';
import { Quiz } from '../interfaces/interfaces';

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