import { ErrorObj, Jwt, Token, AdminQuizCreate } from '../../interfaces/interfaces';
import { registerUser, logoutUserHandler } from './http-auth.test';
import request from 'sync-request';
import { getUrl } from '../helper';
import { tokenToJwt } from '../token';

const URL: string = getUrl();

// CLEAR //
function clearUsers (): void {
  request(
    'DELETE',
    URL + 'v1/clear'
  );
}

beforeEach(() => {
  clearUsers();
});

// Wrapper functions
const RequestCreateQuiz = (jwt: Jwt, name: string, description: string): AdminQuizCreate | ErrorObj => {
  const res = request(
    'POST',
    URL + 'v1/admin/quiz',
    {
      json: {
        token: jwt,
        name: name,
        description: description,
      }
    }
  );
  const parsedResponse: AdminQuizCreate | ErrorObj = JSON.parse(res.body.toString());
  return parsedResponse;
};

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
