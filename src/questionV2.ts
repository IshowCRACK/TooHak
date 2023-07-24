import { ErrorAndStatusCode, Jwt, QuestionBody, QuizQuestionCreate, Token, Question, Quiz, OkObj, AdminQuestionDuplicate } from '../interfaces/interfaces';
import {
  checkAnswerHasTrueValue, checkAnswerLengthValid, checkQuestionAnswerNonDuplicate, checkQuizAndUserIdValid, checkQuizIdValid,
  checkTokenValidSession, checkTokenValidStructure, createQuestionId, getTotalDuration, checkQuestionIdIsValidInQuiz, checkQuestionIdValid
} from './helper';
import { jwtToToken } from './token';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { isWebUri } from 'valid-url';


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
/*The thumbnailUrl is an empty string
The thumbnailUrl does not return to a valid file
The thumbnailUrl, when fetched, is not a JPG or PNg file type*/

if (!questionBody.thumbnailUrl || questionBody.thumbnailUrl === '') {
        throw HTTPError(400, 'Must have thumbnail');
};
if (!questionBody.thumbnailUrl.toLowerCase().includes('png') && !questionBody.thumbnailUrl.toLowerCase().includes('jpg')) {
        throw HTTPError(400, 'Must be a JPG or PNG file type');
    }

    if (!isWebUri(questionBody.thumbnailUrl)) {
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
      
      