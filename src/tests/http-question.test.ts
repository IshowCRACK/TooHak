import request from 'sync-request';
import { AdminQuizCreate, ErrorObj, Jwt, QuestionBody, QuizQuestionCreate, Token, AdminQuizInfo,AdminQuestionDuplicate } from '../../interfaces/interfaces';
import { getUrl } from '../helper';
import { RequestCreateQuiz, clearUsers, registerUser, duplicateQuiz, infoQuiz, logoutUserHandler, deleteQuestion } from './testHelpers';
import { tokenToJwt } from '../token';

const URL: string = getUrl();

beforeEach(() => {
  clearUsers();
});

const createQuizQuestionHandler = (quizId: number, jwt: Jwt, questionBody: QuestionBody) => {
  const res = request(
    'POST',
    URL + `v1/admin/quiz/${quizId}/question`,
    {
      json: {
        token: jwt.token,
        questionBody: questionBody
      }
    }
  );

  const parsedResponse: QuizQuestionCreate | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

describe('Tests related to creating a Quiz Question', () => {
  let userToken: Token;
  let userJwt: Jwt;
  let quizId: number;
  let defaultQuestionBody: QuestionBody;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    quizId = (RequestCreateQuiz(tokenToJwt(userToken), 'Countries of the World', 'Quiz on Countries of the World') as AdminQuizCreate).quizId;

    defaultQuestionBody = {
      question: 'What content is Russia in?',
      duration: 5,
      points: 1,
      answers: [
        {
          answerId: 0,
          answer: 'Asia',
          colour: 'Red',
          correct: true
        },
        {
          answerId: 1,
          answer: 'North America',
          colour: 'Blue',
          correct: false
        },
        {
          answerId: 2,
          answer: 'South America',
          colour: 'Green',
          correct: false
        },
        {
          answerId: 3,
          answer: 'Africa',
          colour: 'Yellow',
          correct: false
        }
      ]
    };
  });

  describe('Unsuccessful Tests', () => {
    test('QuizId does not refer to valid quiz', () => {
      expect(createQuizQuestionHandler(5, userJwt, defaultQuestionBody)).toEqual({
        error: 'Quiz ID does not refer to a valid quiz'
      });
    });

    test('QuizId does not refer to a valid quiz that this user owns', () => {
      const userToken2: Token = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
      expect(createQuizQuestionHandler(quizId, tokenToJwt(userToken2), defaultQuestionBody)).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns'
      });
    });

    test('Question string is wrong format ', () => {
      defaultQuestionBody.question = 'abcd';
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'Question string is less than 5 characters in length or greater than 50 characters in length'
      });

      defaultQuestionBody.question = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'Question string is less than 5 characters in length or greater than 50 characters in length'
      });
    });

    test('The Quesiton has incorrect number of answers', () => {
      for (let i = 0; i < 5; i++) {
        defaultQuestionBody.answers.push({
          answerId: 5,
          answer: 'Australia',
          colour: 'Pink',
          correct: false
        });
      }

      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The question has more than 6 answers or less than 2 answers'
      });

      defaultQuestionBody.answers = [];

      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The question has more than 6 answers or less than 2 answers'
      });
    });

    test('Question duration is negative', () => {
      defaultQuestionBody.duration = -1;
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The question duration is not a positive number'
      });
    });

    test('Question duration is too long', () => {
      defaultQuestionBody.duration = 151;
      createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody);

      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The sum of the question durations in the quiz exceeds 3 minutes'
      });
    });

    test('Question points are invalid', () => {
      defaultQuestionBody.points = 0;

      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The points awarded for the question are less than 1 or greater than 10'
      });

      defaultQuestionBody.points = 11;
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The points awarded for the question are less than 1 or greater than 10'
      });
    });

    test('Invalid answer length', () => {
      defaultQuestionBody.answers[0].answer = '';
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
      });

      defaultQuestionBody.answers[0].answer = 'abcdefghijklmnopqrstuvwxyzabcde';
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
      });
    });

    test('Answer string are duplicates', () => {
      defaultQuestionBody.answers[0].answer = 'North America';
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'Any answer strings are duplicates of one another (within the same question)'
      });
    });

    test('There is no correct answers', () => {
      defaultQuestionBody.answers[0].correct = false;
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'There are no correct answers'
      });
    });
  });

  describe('Successful Tests', () => {
    test('Test for single question creation', () => {
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        questionId: 0
      });
    });

    test('Test for multiple question creations with multiple quizzes', () => {
      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        questionId: 0
      });

      expect(createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody)).toEqual({
        questionId: 1
      });

      const quizId2: number = (RequestCreateQuiz(tokenToJwt(userToken), 'Flags of the World', 'Quiz on Flags of the World') as AdminQuizCreate).quizId;
      expect(createQuizQuestionHandler(quizId2, userJwt, defaultQuestionBody)).toEqual({
        questionId: 0
      });
    });
  });
});

// TESTS FOR QUIZ DUPLICATE //
describe('Quiz Duplicate', () => {
  let userToken: Token;
  let userJwt: Jwt;
  let quizId: number;
  let questionId: number;
  let quizCreate: AdminQuizCreate;
  let defaultQuestionBody: QuestionBody;
  let quizInfo: AdminQuizInfo;
  let quizEditedTime: number;
  let res: AdminQuestionDuplicate | ErrorObj;
  let timeBufferSeconds: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    quizCreate = (RequestCreateQuiz(tokenToJwt(userToken), 'Countries of the World', 'Quiz on Countries of the World') as AdminQuizCreate);
    quizId = quizCreate.quizId;
    timeBufferSeconds = 20;
    defaultQuestionBody = {
      question: 'What content is Russia in?',
      duration: 5,
      points: 1,
      answers: [
        {
          answerId: 0,
          answer: 'Asia',
          colour: 'Red',
          correct: true
        },
        {
          answerId: 1,
          answer: 'North America',
          colour: 'Blue',
          correct: false
        },
        {
          answerId: 2,
          answer: 'South America',
          colour: 'Green',
          correct: false
        },
        {
          answerId: 3,
          answer: 'Africa',
          colour: 'Yellow',
          correct: false
        }
      ]
    };
    questionId = (createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody) as QuizQuestionCreate).questionId;
  });
  describe('Successful Tests', () => {
    beforeEach(() => {
      quizEditedTime = Math.round(Date.now() / 1000);
      res = duplicateQuiz(userJwt, quizId, questionId) as AdminQuestionDuplicate;
    });

    test('1. duplicate a quiz', () => {
      expect(res).toEqual({
        newQuestionId: 1
      });
      quizInfo = infoQuiz(userJwt, quizId) as AdminQuizInfo;
      expect(quizInfo.questions[0].questionId).toStrictEqual(0);
      expect(quizInfo.questions[1].questionId).toStrictEqual(1);
    });

    test('2. Updates the time edited', () => {
      expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime);
      expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime - timeBufferSeconds);
      expect(res).toEqual({
        newQuestionId: 1
      });
    });
  });

  describe('Unsuccessful Tests', () => {
    test('1. QuizId does not refer to valid quiz', () => {
      expect(duplicateQuiz(userJwt, -9, questionId)).toEqual({
        error: 'Quiz ID does not refer to a valid quiz'
      });
    });

    test('2, QuizId does not refer to a valid quiz that this user owns', () => {
      const userToken2: Token = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
      expect(duplicateQuiz(tokenToJwt(userToken2), quizId, questionId)).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns'
      });
    });

    test('3. Question Id does not refer to a valid question within this quiz', () => {
      expect(duplicateQuiz(userJwt, quizId, questionId + 2)).toEqual({
        error: 'Question Id does not refer to a valid question within this quiz'
      });
    });

    test('4. Token is not a valid structure', () => {
      res = res = duplicateQuiz({ token: '-1' }, quizId, questionId);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });

    test('5. Not token of an active session', () => {
      logoutUserHandler(userJwt);
      res = duplicateQuiz(userJwt, quizId, questionId);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });
});

// TESTS FOR QUIZ DELETE //

describe('Tests for adminQuizDelete', () => {
  let userToken: Token;
  let userJwt: Jwt;
  let quizId: number;
  let defaultQuestionBody: QuestionBody;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    quizId = (RequestCreateQuiz(tokenToJwt(userToken), 'Countries of the World', 'Quiz on Countries of the World') as AdminQuizCreate).quizId;

    defaultQuestionBody = {
      question: 'What continent is Russia in?',
      duration: 5,
      points: 1,
      answers: [
        {
          answerId: 0,
          answer: 'Asia',
          colour: 'Red',
          correct: true
        },
        {
          answerId: 1,
          answer: 'North America',
          colour: 'Blue',
          correct: false
        },
        {
          answerId: 2,
          answer: 'South America',
          colour: 'Green',
          correct: false
        },
        {
          answerId: 3,
          answer: 'Africa',
          colour: 'Yellow',
          correct: false
        }
      ]
    };
  });

  describe('Unsuccessful Tests', () => {
    test('token not for currently logged in session', () => {
      const exampleToken: Token = {
        sessionId: '',
        userId: 5
      };
      expect(deleteQuestion(tokenToJwt(exampleToken), quizId, 5)).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('quizId does not refer to a quiz that this user owns', () => {
      expect(deleteQuestion(userJwt, 5, 0)).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('quizId does not refer to a quiz that this user owns', () => {
      const token2 = registerUser('JohnCena@gmail.com', 'Password123', 'John', 'Cena') as Token;
      expect(deleteQuestion(tokenToJwt(token2), 0, 0)).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('quizId does not refer to a valid question within the quiz', () => {
      expect(deleteQuestion(userJwt, quizId, 0)).toStrictEqual({ error: 'Quiz ID does not refer to a valid question within this quiz' });
    });
  });

  describe('Successful Tests', () => {
    test('Successfully deleted question', () => {
      createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody);
      expect(deleteQuestion(userJwt, quizId, 0)).toStrictEqual({});
    });
  });
});
