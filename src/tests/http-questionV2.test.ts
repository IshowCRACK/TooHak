import { AdminQuizCreate, Jwt, QuestionBody, Token } from '../../interfaces/interfaces';
import { clearUsers, registerUser } from './iter2tests/testHelpersv1';
import { RequestCreateQuizV2, createQuizQuestionHandlerV2, deleteQuestionHandlerV2 } from './testhelpersV2';
import { tokenToJwt } from '../token';
// import { token } from 'morgan';

beforeEach(() => {
  clearUsers();
});

afterEach(() => {
  clearUsers();
});

describe('Tests related to creating a Quiz Question', () => {
  let userToken: Token;
  let userJwt: Jwt;
  let quizId: number;
  let defaultQuestionBody: QuestionBody;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    quizId = (RequestCreateQuizV2(tokenToJwt(userToken), 'Countries of the World', 'Quiz on Countries of the World') as AdminQuizCreate).quizId;

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
      ],
      thumbnailUrl: 'https://static.vecteezy.com/system/resources/previews/001/204/011/original/soccer-ball-png.png'
    };
  });

  describe('Unsuccessful Tests', () => {
    test('QuizId does not refer to valid quiz', () => {
      expect(createQuizQuestionHandlerV2(5, userJwt, defaultQuestionBody)).toEqual({
        error: 'Quiz ID does not refer to a valid quiz'
      });
    });

    test('QuizId does not refer to a valid quiz that this user owns', () => {
      const userToken2: Token = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
      expect(createQuizQuestionHandlerV2(quizId, tokenToJwt(userToken2), defaultQuestionBody)).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns'
      });
    });

    test('Question string is wrong format ', () => {
      defaultQuestionBody.question = 'abcd';
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'Question string is less than 5 characters in length or greater than 50 characters in length'
      });

      defaultQuestionBody.question = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
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

      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The question has more than 6 answers or less than 2 answers'
      });

      defaultQuestionBody.answers = [];

      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The question has more than 6 answers or less than 2 answers'
      });
    });

    test('Question duration is negative', () => {
      defaultQuestionBody.duration = -1;
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The question duration is not a positive number'
      });
    });

    test('Question duration is too long', () => {
      defaultQuestionBody.duration = 151;
      createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);

      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The sum of the question durations in the quiz exceeds 3 minutes'
      });
    });

    test('Question points are invalid', () => {
      defaultQuestionBody.points = 0;

      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The points awarded for the question are less than 1 or greater than 10'
      });

      defaultQuestionBody.points = 11;
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The points awarded for the question are less than 1 or greater than 10'
      });
    });

    test('Invalid answer length', () => {
      defaultQuestionBody.answers[0].answer = '';
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
      });

      defaultQuestionBody.answers[0].answer = 'abcdefghijklmnopqrstuvwxyzabcde';
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
      });
    });

    test('Answer string are duplicates', () => {
      defaultQuestionBody.answers[0].answer = 'North America';
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'Any answer strings are duplicates of one another (within the same question)'
      });
    });

    test('There is no correct answers', () => {
      defaultQuestionBody.answers[0].correct = false;
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'There are no correct answers'
      });
    });
    test('no URL', () => {
      defaultQuestionBody.thumbnailUrl = '';
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'Must have thumbnail'
      });
    });

    test('URL not jpeg or png', () => {
      defaultQuestionBody.thumbnailUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1WXM5IVq1TJWzhGKuAC6F6YBcY1yJH4Cc9Q&usqp=CAU';
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'File is not a png or jpg file'
      });
    });

    test('URL not valid ', () => {
      defaultQuestionBody.thumbnailUrl = 'mypng.png';
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        error: 'Invalid URL'
      });
    });
  });

  describe('Successful Tests', () => {
    test('Test for single question creation', () => {
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        questionId: 0
      });
    });

    test('Test for multiple question creations with multiple quizzes', () => {
      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        questionId: 0
      });

      expect(createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody)).toEqual({
        questionId: 1
      });

      const quizId2: number = (RequestCreateQuizV2(tokenToJwt(userToken), 'Flags of the World', 'Quiz on Flags of the World') as AdminQuizCreate).quizId;
      expect(createQuizQuestionHandlerV2(quizId2, userJwt, defaultQuestionBody)).toEqual({
        questionId: 0
      });
    });
  });
});

// TESTS FOR QUESTION DELETE //

describe('Tests for deleteQuestionV2', () => {
  let userToken: Token;
  let userJwt: Jwt;
  let quizId: number;
  let defaultQuestionBody: QuestionBody;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    quizId = (RequestCreateQuizV2(tokenToJwt(userToken), 'Countries of the World', 'Quiz on Countries of the World') as AdminQuizCreate).quizId;

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
      ],
      thumbnailUrl: 'https://static.vecteezy.com/system/resources/previews/001/204/011/original/soccer-ball-png.png'
    };
  });

  describe('Unsuccessful Tests', () => {
    test('token not for currently logged in session', () => {
      const exampleToken: Token = {
        sessionId: '',
        userId: 5
      };
      expect(deleteQuestionHandlerV2(tokenToJwt(exampleToken), quizId, 5)).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('quizId does not refer to a valid quiz', () => {
      expect(deleteQuestionHandlerV2(userJwt, 5, 0)).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('quizId does not refer to a quiz that this user owns', () => {
      const token2 = registerUser('JohnCena@gmail.com', 'Password123', 'John', 'Cena') as Token;
      expect(deleteQuestionHandlerV2(tokenToJwt(token2), 0, 0)).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('quizId does not refer to a valid question within the quiz', () => {
      expect(deleteQuestionHandlerV2(userJwt, quizId, 0)).toStrictEqual({ error: 'Quiz ID does not refer to a valid question within this quiz' });
    });
  });

  /*

                NEED TO ADD TESTS: All sessions for this quiz must be in END state ,

                USE THE GET SESSION STATUS FUNCTION TO ERROR CHECK WHEN WE FINSIH THAT FUNCTION

        */

  describe('Successful Tests', () => {
    test('Successfully deleted question', () => {
      createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);
      expect(deleteQuestionHandlerV2(userJwt, quizId, 0)).toStrictEqual({});
    });
  });
});
