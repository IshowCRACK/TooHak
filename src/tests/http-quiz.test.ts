import { ErrorObj, Jwt, OkObj, Token, AdminQuizCreateReturn } from '../../interfaces/interfaces';
import { registerUser, logoutUserHandler} from './http-auth.test'
import request from 'sync-request';
import { getUrl, checkQuizIdValid } from '../helper';
import { jwtToToken, objToJwt, tokenToJwt } from '../token';
import { checkTokenValid } from './testHelpers';

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
const RequestCreateQuiz = (jwt: Jwt, name: string, description: string): AdminQuizCreateReturn => {
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
  const parsedResponse: AdminQuizCreateReturn = JSON.parse(res.body.toString());

  if ('error' in parsedResponse) {
    return parsedResponse;
  } else {
    return parsedResponse;
  }
};

// TESTS FOR QUIZ CREATE //
describe('Quiz view Trash tests', () => {
  let jwt: Jwt;
  let token0: Token;
  let token1: Token;
  let res: AdminQuizCreateReturn;
  let res0: AdminQuizCreateReturn;


  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    logoutUserHandler(tokenToJwt(token1));
  });
  describe ('Successful Tests', ()=> {
    test('Successfull Quiz Create for 1 User', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ quizId: 0 });
      expect(checkQuizIdValid(0) as Boolean).toStrictEqual(true)
    });

    test('Successfull Quiz Create for multiple Users', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), 'Quiz0', 'Description0');
      res0 = RequestCreateQuiz(tokenToJwt(token1), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ quizId: 0 });
      expect(res0).toStrictEqual({ quizId: 1 });
      expect(checkQuizIdValid(0) as Boolean).toStrictEqual(true)
      expect(checkQuizIdValid(1) as Boolean).toStrictEqual(true)
    });
  });

  describe ('Unsuccessful Tests', ()=> {
    test('Not token of an active session', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ error: "Token not for currently logged in session", statusCode: 403 });
    });

    test('Invalid Name ', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), '', 'Description0');
      expect(res).toStrictEqual({ error: 'A name must be entered', statusCode: 400 });
    });

    test('Invalid Name ', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), '12', 'Description0');
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters', statusCode: 400 });
    });

    test('Invalid Name ', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), 'abcde12345abcde12345abcde12345sdf', 'Description0');
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters', statusCode: 400 });
    });

    test('Non Alphanumeric ', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), '(*#&$*@#($()@#$', 'Description0');
      expect(res).toStrictEqual({ error: 'Must use only alphanumeric characters or spaces in name', statusCode: 400 });
    });

    test('Invalid Description ', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), 'Quiz0', '12345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910343142432dfasdf');
      expect(res).toStrictEqual({ error: 'Description must be under 100 characters', statusCode: 400 });
    });

    test('Invalid Description', () => {
      res = RequestCreateQuiz(tokenToJwt(token1), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ error: 'Must use only alphanumeric characters or spaces in name', statusCode: 400 });
    });

    test('Name already used', () => {
      RequestCreateQuiz(tokenToJwt(token1), 'Quiz0', 'Description0');
      res = RequestCreateQuiz(tokenToJwt(token1), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ error: 'Quiz name is already in use', statusCode: 400 });
    });
    

  });

});
