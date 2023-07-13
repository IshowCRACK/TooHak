import { ErrorObj, Token, AdminQuizCreate, OkObj, Jwt, AdminQuizInfo} from '../../interfaces/interfaces';
import { registerUser, logoutUserHandler } from './http-auth.test';
import { tokenToJwt, jwtToToken } from '../token';
import request from 'sync-request';
import { getUrl } from '../helper';
import { RequestCreateQuiz, RequestRemoveQuiz, clearUsers, listQuiz } from './testHelpers';


const URL: string = getUrl();

beforeEach(() => {
  clearUsers();
});


// Wrapper functions

const RequestInfoQuiz = (jwt: Jwt, quizId: number): AdminQuizInfo | ErrorObj => {
  const res = request(
    'GET',
    URL + `v1/admin/quiz/${quizId}`,
    {
      qs: {
        token: jwt.token,
      }
    }
  );

  const parsedResponse: AdminQuizInfo | ErrorObj = JSON.parse(res.body.toString());
  return parsedResponse;
};

// TESTS FOR QUIZ INFO //
describe('Quiz Info', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: number;
  let quizId1: number;
  let quizId2: number;
  let res: AdminQuizInfo | ErrorObj;
  let res0: AdminQuizInfo | ErrorObj;
  //  Giving a 10 second buffer for tests to run
  const timeBufferSeconds = 20;
  let quizCreationTime: number;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    quizId0 = (RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuiz(tokenToJwt(token0), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuiz(tokenToJwt(token1), 'Quiz2', 'Description 2') as AdminQuizCreate).quizId;
    logoutUserHandler(tokenToJwt(token1));
  });

  describe('Successful tests', () => {

    beforeEach(() => {
      quizCreationTime = Math.round(Date.now() / 1000);
    });

    test('1. valid token and quizId for 1 owned quiz', () => {

      res = RequestInfoQuiz(tokenToJwt(token0), quizId0) as AdminQuizInfo;
      expect(res).toEqual(
                expect.objectContaining({
                  quizId: quizId0,
                  name: 'Quiz0',
                  description: 'Description 0',
                  numQuestions:0, 
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

    res = RequestInfoQuiz(tokenToJwt(token0), quizId0) as AdminQuizInfo;
    res0 = RequestInfoQuiz(tokenToJwt(token0), quizId1) as AdminQuizInfo;
    
    expect(res).toEqual(
              expect.objectContaining({
                quizId: quizId0,
                name: 'Quiz0',
                description: 'Description 0',
                numQuestions:0, 
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
        numQuestions:0, 
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
      res = RequestInfoQuiz(tokenToJwt(token0), -99);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('2. Quiz ID does not refer to a quiz that this user owns', () => {
      res = RequestInfoQuiz(tokenToJwt(token0), quizId2);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
    test('3. Not token of an active session', () => {
      res = RequestInfoQuiz(tokenToJwt(token1), quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Token is not a valid structure', () => {
      res = RequestInfoQuiz({token: '-1'}, quizId1);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });
  });

});


// TESTS FOR QUIZ REMOVE //
describe('Quiz Remove', () => {
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
    quizId0 = (RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuiz(tokenToJwt(token0), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuiz(tokenToJwt(token1), 'Quiz2', 'Description 2') as AdminQuizCreate).quizId;
    logoutUserHandler(tokenToJwt(token1));
  });
  describe('Successful Tests', () => {
    test('1. Successful Quiz Remove for User', () => {
      res = RequestRemoveQuiz(tokenToJwt(token0), quizId0);
      expect(res).toStrictEqual({

      });
    });

    test('2. Successfull Quiz Create multiple for User', () => {
      res = RequestRemoveQuiz(tokenToJwt(token0), quizId0);
      res0 = RequestRemoveQuiz(tokenToJwt(token0), quizId1);
      expect(res).toStrictEqual({

      });
      expect(res0).toStrictEqual({

      });
    });
  });

  describe('Unsuccessful Tests', () => {
    test('3. Not token of an active session', () => {
      res = RequestRemoveQuiz(tokenToJwt(token1), quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Invalid QuizId ', () => {
      res = RequestRemoveQuiz(tokenToJwt(token0), -99);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('5. Quiz ID does not refer to a quiz that this user owns', () => {
      res = RequestRemoveQuiz(tokenToJwt(token0), quizId2);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
  });
});

// TESTS FOR QUIZ CREATE //
describe('Quiz Create', () => {
  let token0: Token;
  let token1: Token;
  let res: AdminQuizCreate | ErrorObj;
  let res0: AdminQuizCreate | ErrorObj;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    logoutUserHandler(tokenToJwt(token1));
  });
  describe('Successful Tests', () => {
    test('1. Successfull Quiz Create for User', () => {
      res = RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ quizId: 0 });
    });

    test('2. Successfull Quiz Create multiple for User', () => {
      res = RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description0');
      res0 = RequestCreateQuiz(tokenToJwt(token0), 'Quiz1', 'Description0');
      expect(res).toStrictEqual({ quizId: 0 });
      expect(res0).toStrictEqual({ quizId: 1 });
    });
  });

  describe('Unsuccessful Tests', () => {
    test('3. Not token of an active session', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), 'Quiz1', 'Description1');
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Invalid Name ', () => {
      res = RequestCreateQuiz(tokenToJwt(token0), '', 'Description0');
      expect(res).toStrictEqual({ error: 'A name must be entered' });
    });

    test('5. Invalid Name ', () => {
      res = RequestCreateQuiz(tokenToJwt(token0), '12', 'Description0');
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('6. Invalid Name ', () => {
      res = RequestCreateQuiz(tokenToJwt(token0), 'abcde12345abcde12345abcde12345sdf', 'Description0');
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('7. Non Alphanumeric ', () => {
      res = RequestCreateQuiz(tokenToJwt(token0), '(*#&$*@#($()@#$', 'Description0');
      expect(res).toStrictEqual({ error: 'Must use only alphanumeric characters or spaces in name' });
    });

    test('8. Invalid Description ', () => {
      res = RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', '12345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910343142432dfasdf');
      expect(res).toStrictEqual({ error: 'Description must be under 100 characters' });
    });

    test('10. Name already used', () => {
      RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description0');
      res = RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ error: 'Quiz name is already in use' });
    });
  });

});


// TESTS FOR QUIZ LIST //
describe('adminQuizList tests', () => {
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
      expect(listQuiz(tokenToJwt(token))).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });

  describe('Successful tests', () => {
    test('User with no owned quizzes', () => {
      expect(listQuiz(jwt)).toStrictEqual({ quizzes: [] });
    });

    test('User with one owned quizzes', () => {
      RequestCreateQuiz(jwt, 'Countries of the world', 'Quiz on all countries');
      expect(listQuiz(jwt)).toStrictEqual({ quizzes: [{ quizId: 0, name: 'Countries of the world' }] });
    });

    test('User with multiple owned quizzes', () => {
      RequestCreateQuiz(jwt, 'Countries of the world', 'Quiz on all countries');
      RequestCreateQuiz(jwt, 'Flags of the world', 'Quiz on all flags');
      expect(listQuiz(jwt)).toStrictEqual({ quizzes: [{ quizId: 0, name: 'Countries of the world' }, { quizId: 1, name: 'Flags of the world' }] });
    });
  });
});