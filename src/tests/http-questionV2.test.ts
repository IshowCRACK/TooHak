import { AdminQuizCreate, ErrorObj, Jwt, QuestionBody, QuizQuestionCreate, Token, AdminQuizInfo, AdminQuestionDuplicate, OkSessionObj } from '../../interfaces/interfaces';
import { clearUsers, registerUser } from './iter2tests/testHelpersv1';
import { RequestCreateQuizV2, infoQuizV2, moveQuestionV2, deleteQuestionV2, duplicateQuizV2, logoutUserHandlerV2, createQuizQuestionHandlerV2, updateQuizV2, startSessionQuiz, updateQuizSessionStateHandler } from './testhelpersV2';
import { tokenToJwt } from '../token';

beforeEach(() => {
  clearUsers();
});

afterEach(() => {
  clearUsers();
});

// TEST FOR QUESTION CREATE //
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
      duration: 0.1,
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

// TEST FOR QUESTION UPDATE //
describe('Tests to update question', () => {
  let userToken: Token;
  let userJwt: Jwt;
  let quizId: number;
  let defaultQuestionBody: QuestionBody;
  let beforeQuestionBody: QuestionBody;
  let questionId: number;
  let quizEditedTime:number;
  let quizInfo: AdminQuizInfo;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    quizId = (RequestCreateQuizV2(tokenToJwt(userToken), 'Countries of the World', 'Quiz on Countries of the World') as AdminQuizCreate).quizId;

    beforeQuestionBody = {
      question: 'What continent is China in?',
      duration: 0.1,
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
    defaultQuestionBody = {
      question: 'What continent is Russia in?',
      duration: 0.1,
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
    questionId = (createQuizQuestionHandlerV2(quizId, userJwt, beforeQuestionBody) as QuizQuestionCreate).questionId;
  });

  describe('Unsuccessful Tests', () => {
    test('QuizId does not refer to valid quiz', () => {
      expect(updateQuizV2(userJwt, defaultQuestionBody, -1, questionId)).toEqual({
        error: 'Quiz ID does not refer to a valid quiz'
      });
    });

    test('QuizId does not refer to a valid quiz that this user owns', () => {
      const userToken2: Token = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
      expect(updateQuizV2(tokenToJwt(userToken2), defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns'
      });
    });
    test('3. Question Id does not refer to a valid question within this quiz', () => {
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId + 3)).toEqual({
        error: 'Question Id does not refer to a valid question within this quiz'
      });
    });

    test('Question string is wrong format ', () => {
      defaultQuestionBody.question = 'abcd';
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'Question string is less than 5 characters in length or greater than 50 characters in length'
      });

      defaultQuestionBody.question = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
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

      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'The question has more than 6 answers or less than 2 answers'
      });

      defaultQuestionBody.answers = [];

      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'The question has more than 6 answers or less than 2 answers'
      });
    });

    test('Question duration is negative', () => {
      defaultQuestionBody.duration = -1;
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'The question duration is not a positive number'
      });
    });

    test('Question duration is too long', () => {
      defaultQuestionBody.duration = 151;
      updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId);

      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'The sum of the question durations in the quiz exceeds 3 minutes'
      });
    });

    test('Question points are invalid', () => {
      defaultQuestionBody.points = 0;

      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'The points awarded for the question are less than 1 or greater than 10'
      });

      defaultQuestionBody.points = 11;
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'The points awarded for the question are less than 1 or greater than 10'
      });
    });

    test('Invalid answer length', () => {
      defaultQuestionBody.answers[0].answer = '';
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
      });

      defaultQuestionBody.answers[0].answer = 'abcdefghijklmnopqrstuvwxyzabcde';
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
      });
    });

    test('Answer string are duplicates', () => {
      defaultQuestionBody.answers[0].answer = 'North America';
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'Any answer strings are duplicates of one another (within the same question)'
      });
    });

    test('There is no correct answers', () => {
      defaultQuestionBody.answers[0].correct = false;
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'There are no correct answers'
      });
    });
    test('no URL', () => {
      defaultQuestionBody.thumbnailUrl = '';
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'Must have thumbnail'
      });
    });

    test('URL not jpeg or png', () => {
      defaultQuestionBody.thumbnailUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1WXM5IVq1TJWzhGKuAC6F6YBcY1yJH4Cc9Q&usqp=CAU';
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'File is not a png or jpg file'
      });
    });

    test('URL not valid ', () => {
      defaultQuestionBody.thumbnailUrl = 'mypng.png';
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toEqual({
        error: 'Invalid URL'
      });
    });
  });

  describe('Successful Tests', () => {
    test('update quiz', () => {
      expect(updateQuizV2(userJwt, defaultQuestionBody, quizId, questionId)).toStrictEqual({});
      quizInfo = infoQuizV2(userJwt, quizId) as AdminQuizInfo;
      expect(quizInfo.questions[0].question).toStrictEqual(defaultQuestionBody.question);
    });

    test('update time edited', () => {
      const timeBufferSeconds = 20;
      quizInfo = infoQuizV2(userJwt, quizId) as AdminQuizInfo;
      quizEditedTime = Math.round(Date.now() / 1000);
      expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime);
      expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime - timeBufferSeconds);
    });
  });
});

// TESTS FOR QUESTION DELETE //

describe('Tests for adminQuizDelete', () => {
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
      duration: 0.1,
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
    startSessionQuiz(userJwt, 30, quizId) as OkSessionObj;
  });

  describe('Unsuccessful Tests', () => {
    test('token not for currently logged in session', () => {
      const exampleToken: Token = {
        sessionId: '',
        userId: 5
      };
      expect(deleteQuestionV2(tokenToJwt(exampleToken), quizId, 5)).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('quizId does not refer to a valid quiz', () => {
      expect(deleteQuestionV2(userJwt, 5, 0)).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('quizId does not refer to a quiz that this user owns', () => {
      const token2 = registerUser('JohnCena@gmail.com', 'Password123', 'John', 'Cena') as Token;
      expect(deleteQuestionV2(tokenToJwt(token2), 0, 0)).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('All sessions for this quiz must be in END state', () => {
      createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);
      startSessionQuiz(userJwt, 1, quizId) as OkSessionObj;
      expect(deleteQuestionV2(userJwt, quizId, 0)).toStrictEqual({ error: 'All sessions for this quiz must be in END state' });
    });

    test('quizId does not refer to a valid question within the quiz', () => {
      expect(deleteQuestionV2(userJwt, quizId, 0)).toStrictEqual({ error: 'Quiz ID does not refer to a valid question within this quiz' });
    });
  });

  describe('Successful Tests', () => {
    test('Successfully deleted question', () => {
      createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);
      const sessionId = startSessionQuiz(userJwt, 1, quizId) as OkSessionObj;
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'END');
      expect(deleteQuestionV2(userJwt, quizId, 0)).toStrictEqual({});
    });
  });
});

// TEST FOR QUIZ MOVE QUESTION //

describe('Tests for quizMoveQuestion', () => {
  let userToken: Token;
  let userJwt: Jwt;
  let quizId: number;
  let defaultQuestionBody: QuestionBody;
  let secondQuestionBody: QuestionBody;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    quizId = (RequestCreateQuizV2(tokenToJwt(userToken), 'Countries of the World', 'Quiz on Countries of the World') as AdminQuizCreate).quizId;

    defaultQuestionBody = {
      question: 'What continent is Russia in?',
      duration: 0.1,
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

    secondQuestionBody = {
      question: 'What continent is Australia in?',
      duration: 0.1,
      points: 1,
      answers: [
        {
          answerId: 0,
          answer: 'Asia',
          colour: 'Red',
          correct: false
        },
        {
          answerId: 1,
          answer: 'North America',
          colour: 'Blue',
          correct: false
        },
        {
          answerId: 2,
          answer: 'Australia',
          colour: 'Green',
          correct: true
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

  describe('Unsuccessful tests', () => {
    test('token not for currently logged in session', () => {
      const exampleToken: Token = {
        sessionId: '',
        userId: 5
      };
      expect(moveQuestionV2(quizId, 0, 1, tokenToJwt(exampleToken))).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('quizId does not refer to a valid quiz', () => {
      expect(moveQuestionV2(5, 0, 1, userJwt)).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('quizId does not refer to a quiz that this user owns', () => {
      const token2 = registerUser('JohnCena@gmail.com', 'Password123', 'John', 'Cena') as Token;
      expect(moveQuestionV2(quizId, 0, 1, tokenToJwt(token2))).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('quizId does not refer to a valid question within the quiz', () => {
      expect(moveQuestionV2(quizId, 0, 1, userJwt)).toStrictEqual({ error: 'Quiz ID does not refer to a valid question within this quiz' });
    });

    test('newPosition is less than 0', () => {
      createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);
      expect(moveQuestionV2(quizId, 0, -1, userJwt)).toStrictEqual({ error: 'New Position is less than 0 or New Position is greater than the number of questions' });
    });

    test('newPosition is greater than n-1 where n is the number of questions', () => {
      createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);
      expect(moveQuestionV2(quizId, 0, 5, userJwt)).toStrictEqual({ error: 'New Position is less than 0 or New Position is greater than the number of questions' });
    });

    test('newPosition is the position of the current question', () => {
      createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);
      expect(moveQuestionV2(quizId, 0, 0, userJwt)).toStrictEqual({ error: 'New Position is the position of the current question' });
    });
  });

  describe('Successful tests', () => {
    test('moving elements forwards', () => {
      createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);
      createQuizQuestionHandlerV2(quizId, userJwt, secondQuestionBody);
      expect(moveQuestionV2(quizId, 0, 1, userJwt)).toStrictEqual({});
    });

    test('moving elements backwards', () => {
      createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);
      createQuizQuestionHandlerV2(quizId, userJwt, secondQuestionBody);
      expect(moveQuestionV2(quizId, 1, 0, userJwt)).toStrictEqual({});
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
    quizCreate = (RequestCreateQuizV2(tokenToJwt(userToken), 'Countries of the World', 'Quiz on Countries of the World') as AdminQuizCreate);
    quizId = quizCreate.quizId;
    timeBufferSeconds = 20;
    defaultQuestionBody = {
      question: 'What content is Russia in?',
      duration: 0.1,
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
    questionId = (createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody) as QuizQuestionCreate).questionId;
  });
  describe('Successful Tests', () => {
    beforeEach(() => {
      quizEditedTime = Math.round(Date.now() / 1000);
      res = duplicateQuizV2(userJwt, quizId, questionId) as AdminQuestionDuplicate;
    });

    test('1. duplicate a quiz', () => {
      expect(res).toEqual({
        newQuestionId: 1
      });
      quizInfo = infoQuizV2(userJwt, quizId) as AdminQuizInfo;
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
      expect(duplicateQuizV2(userJwt, -9, questionId)).toEqual({
        error: 'Quiz ID does not refer to a valid quiz'
      });
    });

    test('2, QuizId does not refer to a valid quiz that this user owns', () => {
      const userToken2: Token = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
      expect(duplicateQuizV2(tokenToJwt(userToken2), quizId, questionId)).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns'
      });
    });

    test('3. Question Id does not refer to a valid question within this quiz', () => {
      expect(duplicateQuizV2(userJwt, quizId, questionId + 2)).toEqual({
        error: 'Question Id does not refer to a valid question within this quiz'
      });
    });

    test('4. Token is not a valid structure', () => {
      res = res = duplicateQuizV2({ token: '-1' }, quizId, questionId);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });

    test('5. Not token of an active session', () => {
      logoutUserHandlerV2(userJwt);
      res = duplicateQuizV2(userJwt, quizId, questionId);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });
});
