import { ErrorObj, Token, AdminQuizCreate, Jwt, OkObj, AdminQuizInfo } from '../../interfaces/interfaces';
import { tokenToJwt } from '../token';
import { registerUser, clearUsers, createQuizQuestionHandler } from './iter2tests/testHelpersv1';
import { RequestCreateQuizV2, RequestRemoveQuizV2, infoQuizV2, listQuizV2, logoutUserHandlerV2, startSessionQuiz, updateNameQuizV2 } from './testhelpersV2';

beforeEach(() => {
  clearUsers();
});

afterEach(() => {
  clearUsers();
});

const defaultQuestionBody = {
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

// TESTS FOR QUIZ CREATE //
describe('Quiz CreateV2', () => {
  let token0: Token;
  let token1: Token;
  let res: AdminQuizCreate | ErrorObj;
  let res0: AdminQuizCreate | ErrorObj;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    logoutUserHandlerV2(tokenToJwt(token1));
  });
  describe('Successful Tests', () => {
    test('1. Successfull Quiz Create for User', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ quizId: 0 });
    });

    test('2. Successfull Quiz Create multiple for User', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description0');
      res0 = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz1', 'Description0');
      expect(res).toStrictEqual({ quizId: 0 });
      expect(res0).toStrictEqual({ quizId: 1 });
    });
  });

  describe('Unsuccessful Tests', () => {
    test('3. Not token of an active session', () => {
      res = RequestCreateQuizV2(tokenToJwt(token1), 'Quiz1', 'Description1');
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Invalid Name ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), '', 'Description0');
      expect(res).toStrictEqual({ error: 'A name must be entered' });
    });

    test('5. Invalid Name ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), '12', 'Description0');
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('6. Invalid Name ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), 'abcde12345abcde12345abcde12345sdf', 'Description0');
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('7. Non Alphanumeric ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), '(*#&$*@#($()@#$', 'Description0');
      expect(res).toStrictEqual({ error: 'Must use only alphanumeric characters or spaces in name' });
    });

    test('8. Invalid Description ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', '12345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910343142432dfasdf');
      expect(res).toStrictEqual({ error: 'Description must be under 100 characters' });
    });

    test('10. Name already used', () => {
      RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description0');
      res = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ error: 'Quiz name is already in use' });
    });
  });
});

// TESTS FOR QUIZ LIST //
describe('adminQuizListV2 tests', () => {
  let jwt: Jwt;
  beforeEach(() => {
    const token = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    jwt = tokenToJwt(token);
  });

  describe('Unsuccessful test', () => {
    test('Invalid user', () => {
      const token: Token = {
        sessionId: '',
        userId: 1
      };
      expect(listQuizV2(tokenToJwt(token))).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });

  describe('Successful tests', () => {
    test('User with no owned quizzes', () => {
      expect(listQuizV2(jwt)).toStrictEqual({ quizzes: [] });
    });

    test('User with one owned quizzes', () => {
      RequestCreateQuizV2(jwt, 'Countries of the world', 'Quiz on all countries');
      expect(listQuizV2(jwt)).toStrictEqual({ quizzes: [{ quizId: 0, name: 'Countries of the world' }] });
    });

    test('User with multiple owned quizzes', () => {
      RequestCreateQuizV2(jwt, 'Countries of the world', 'Quiz on all countries');
      RequestCreateQuizV2(jwt, 'Flags of the world', 'Quiz on all flags');
      expect(listQuizV2(jwt)).toStrictEqual({ quizzes: [{ quizId: 0, name: 'Countries of the world' }, { quizId: 1, name: 'Flags of the world' }] });
    });
  });
});
// TESTS FOR QUIZ REMOVE //
describe('Quiz RemoveV2', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: number;
  let quizId1: number;
  let quizId2: number;
  let res: OkObj | ErrorObj;
  let res0: OkObj | ErrorObj;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    quizId0 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuizV2(tokenToJwt(token1), 'Quiz2', 'Description 2') as AdminQuizCreate).quizId;
    logoutUserHandlerV2(tokenToJwt(token1));
  });
  describe('Successful Tests', () => {
    test('1. Successful Quiz Remove for User', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token0), quizId0);
      expect(res).toStrictEqual({

      });
    });

    test('2. Successfull Quiz Create multiple for User', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token0), quizId0);
      res0 = RequestRemoveQuizV2(tokenToJwt(token0), quizId1);
      expect(res).toStrictEqual({

      });
      expect(res0).toStrictEqual({

      });
    });
  });

  describe('Unsuccessful Tests', () => {
    test('3. Not token of an active session', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token1), quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Invalid QuizId ', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token0), -99);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('5. Quiz ID does not refer to a quiz that this user owns', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token0), quizId2);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
  });
});

// TESTS FOR QUIZ INFO //
describe('Quiz InfoV2', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: number;
  let quizId1: number;
  let quizId2: number;
  let res: AdminQuizInfo | ErrorObj;
  let res0: AdminQuizInfo | ErrorObj;
  //  Giving a 20 second buffer for tests to run
  const timeBufferSeconds = 20;
  let quizCreationTime: number;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    quizId0 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuizV2(tokenToJwt(token1), 'Quiz2', 'Description 2') as AdminQuizCreate).quizId;
    logoutUserHandlerV2(tokenToJwt(token1));
  });

  describe('Successful tests', () => {
    beforeEach(() => {
      quizCreationTime = Math.round(Date.now() / 1000);
    });

    test('1. valid token and quizId for 1 owned quiz', () => {
      res = infoQuizV2(tokenToJwt(token0), quizId0) as AdminQuizInfo;
      expect(res).toEqual(
        expect.objectContaining({
          quizId: quizId0,
          name: 'Quiz0',
          description: 'Description 0',
          numQuestions: 0,
          questions: [],
          duration: 0
        })
      );

      expect(res.timeCreated).toBeLessThanOrEqual(quizCreationTime);
      expect(res.timeCreated).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
      expect(res.timeLastEdited).toBeLessThanOrEqual(quizCreationTime);
      expect(res.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
    });

    test('2. valid token and quizId for multiple owned quiz', () => {
      res = infoQuizV2(tokenToJwt(token0), quizId0) as AdminQuizInfo;
      res0 = infoQuizV2(tokenToJwt(token0), quizId1) as AdminQuizInfo;

      expect(res).toEqual(
        expect.objectContaining({
          quizId: quizId0,
          name: 'Quiz0',
          description: 'Description 0',
          numQuestions: 0,
          questions: [],
          duration: 0
        })
      );

      expect(res.timeCreated).toBeLessThanOrEqual(quizCreationTime);
      expect(res.timeCreated).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
      expect(res.timeLastEdited).toBeLessThanOrEqual(quizCreationTime);
      expect(res.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);

      expect(res0).toEqual(
        expect.objectContaining({
          quizId: quizId1,
          name: 'Quiz1',
          description: 'Description 1',
          numQuestions: 0,
          questions: [],
          duration: 0
        })
      );

      expect(res0.timeCreated).toBeLessThanOrEqual(quizCreationTime);
      expect(res0.timeCreated).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
      expect(res0.timeLastEdited).toBeLessThanOrEqual(quizCreationTime);
      expect(res0.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
    });
  });

  describe('Unsuccessful tests', () => {
    test('1 Invalid QuizId ', () => {
      res = infoQuizV2(tokenToJwt(token0), -99);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('2. Quiz ID does not refer to a quiz that this user owns', () => {
      res = infoQuizV2(tokenToJwt(token0), quizId2);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
    test('3. Not token of an active session', () => {
      res = infoQuizV2(tokenToJwt(token1), quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Token is not a valid structure', () => {
      res = infoQuizV2({ token: '-1' }, quizId1);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });
  });
});

// TESTS FOR QUIZ UPDATE NAME //
describe('Quiz Update NameV2', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: number;
  let quizId1: number;
  let res: OkObj | ErrorObj;
  let quizInfo: AdminQuizInfo;

  //  Giving a 20 second buffer for tests to run
  const timeBufferSeconds = 20;
  let quizEditedTime: number;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    quizId0 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuizV2(tokenToJwt(token1), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
  });
  describe('Successful test', () => {
    beforeEach(() => {
      quizEditedTime = Math.round(Date.now() / 1000);
      res = updateNameQuizV2(tokenToJwt(token0), 'Quiz 0 Updated', quizId0) as OkObj;
      quizInfo = infoQuizV2(tokenToJwt(token0), quizId0) as AdminQuizInfo;
    });

    test('1. Updates the name of an existing quiz', () => {
      expect(quizInfo.name).toStrictEqual('Quiz 0 Updated');
      expect(res).toStrictEqual({});
    });

    test('2. Updates the time edited', () => {
      expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime);
      expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime + timeBufferSeconds);
      expect(res).toEqual({});
    });
  });

  describe('Unsuccessful test', () => {
    test('1. Returns an error when Quiz ID does not refer to a valid quiz', () => {
      res = updateNameQuizV2(tokenToJwt(token0), 'Quiz 0 Updated', -9);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('2. Quiz ID does not refer to a quiz that this user owns', () => {
      res = updateNameQuizV2(tokenToJwt(token0), 'Quiz 1 Updated', quizId1);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('3. Non alphanumeric name entered', () => {
      res = updateNameQuizV2(tokenToJwt(token0), '~ Quiz 0 Updated ~', quizId0);
      expect(res).toStrictEqual({ error: 'Must use only alphanumeric characters or spaces in name' });
    });

    test('4. Less than 3 characters', () => {
      res = updateNameQuizV2(tokenToJwt(token0), 'hi', quizId0);
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('5. More than 30 characters', () => {
      res = updateNameQuizV2(tokenToJwt(token0), 'abcdefghijklmnopqrstuvwxyz12345', quizId0);
      expect(res).toStrictEqual(
        { error: 'Name must be between 3 and 30 characters' });
    });

    test('6. Name already used by same user', () => {
      updateNameQuizV2(tokenToJwt(token0), 'Quiz 0 Updated', quizId0);
      res = updateNameQuizV2(tokenToJwt(token0), 'Quiz 0 Updated', quizId0);
      expect(res).toStrictEqual({ error: 'Quiz name is already in use' });
    });

    test('7. Token is not a valid structure', () => {
      res = updateNameQuizV2({ token: '-1' }, 'Quiz 0 Updated', quizId0);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });

    test('8. Not token of an active session', () => {
      logoutUserHandlerV2(tokenToJwt(token1));
      res = updateNameQuizV2(tokenToJwt(token1), 'Quiz 1 Updated', quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });
});

describe('Start new session', () => {
  let userJwt: Jwt;
  let userJwt2: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let quizId: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;

    userJwt2 = tokenToJwt(userToken2);
    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody);
  });

  describe('Unsucessful cases', () => {
    test('Quiz ID does not refer to a valid quiz', () => {
      expect(startSessionQuiz(userJwt, 0, quizId + 1)).toEqual(
        { error: 'Quiz ID does not refer to a valid quiz' }
      );
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      expect(startSessionQuiz(userJwt2, 0, quizId)).toEqual(
        { error: 'Quiz ID does not refer to a quiz that this user owns' }
      );
    });

    test('autoStartNum is greater than 50', () => {
      expect(startSessionQuiz(userJwt, 51, quizId)).toEqual({
        error: 'autoStartNum is a number greater than 50'
      });
    });

    test('More than 10 active sessions', () => {
      for (let i = 0; i <= 10; ++i) {
        expect(startSessionQuiz(userJwt, 30, quizId)).toHaveProperty('sessionId');
      }

      expect(startSessionQuiz(userJwt, 30, quizId)).toEqual({
        error: 'More than 10 active sessions'
      });
    });

    test('quiz does not have any questions in it', () => {
      const quizId2 = (RequestCreateQuizV2(userJwt2, 'Countries of the World', 'Quiz on all countries') as AdminQuizCreate).quizId;
      expect(startSessionQuiz(userJwt2, 0, quizId2)).toEqual({
        error: 'The quiz does not have any questions in it'
      });
    });
  });

  describe('Successful cases', () => {
    test('Single successful', () => {
      expect(startSessionQuiz(userJwt, 30, quizId)).toHaveProperty('sessionId');
    });
  });
});
