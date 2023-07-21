import { ErrorObj, Token, AdminQuizCreate, OkObj, Jwt, AdminQuizInfo } from '../../interfaces/interfaces';
import { tokenToJwt } from '../token';
import { registerUser, logoutUserHandlerV2, RequestCreateQuizV2, RequestRemoveQuiz, clearUsers, listQuizV2, updateNameQuiz, infoQuiz, quizTransferHandler, updateDescriptionQuiz, viewQuizTrashHandler, trashRestoreQuizHandler, emptyTrashHandler } from './testHelpers';

beforeEach(() => {
  clearUsers();
});

afterEach(() => {
  clearUsers();
});

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
