import { ErrorObj, Jwt, Token, AdminQuizCreate, AdminQuizRemove, AdminQuizALLDetails } from '../../interfaces/interfaces';
import { registerUser, logoutUserHandler } from './http-auth.test';
import request from 'sync-request';
import { getUrl, adminUserALLDetails } from '../helper';
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

const RequestRemoveQuiz = (jwt: Jwt, quizId: number): OkObj | ErrorObj => {
  const res = request(
    'DELETE',
    URL + 'v1/admin/quiz/:quizId',
    {
      json: {
        token: jwt,
        quizId: quizId,
      }
    }
  );
  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());
  return parsedResponse;
};

// TESTS FOR QUIZ REMOVE //
describe('Quiz Create', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: AdminQuizCreate;
  let quizId1: AdminQuizCreate;
  let quizId2: AdminQuizCreate;
  let res: OkObj | ErrorObj;
  let res0: OkObj | ErrorObj;
  let res1: OkObj | ErrorObj;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones');
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama');
    quizId0 = RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description 0');
    quizId1 = RequestCreateQuiz(tokenToJwt(token0), 'Quiz1', 'Description 1');
    quizId2 = RequestCreateQuiz(tokenToJwt(token1), 'Quiz2', 'Description 2');
    logoutUserHandler(tokenToJwt(token1));

  });
  describe('Successful Tests', () => {
    test('1. Successfull Quiz Remove for User', () => {
      res = RequestRemoveQuiz(tokenToJwt(token0), quizId0);
      expect(res).toStrictEqual({

      });
      // check the 'deletedQuizzes' Array for removed Quiz
      expect((adminUserALLDetails(token0.userId) as AdminUserALLDetails).user.deletedQuizzes[0].quizId).toEqual(quizId0);

    });

    test('2. Successfull Quiz Create multiple for User', () => {
      res0 = RequestRemoveQuiz(tokenToJwt(token0), quizId0);
      res1 = RequestRemoveQuiz(tokenToJwt(token0), quizId1);
      expect(res).toStrictEqual({

      });
      expect(res0).toStrictEqual({

      });
      // check the 'deletedQuizzes' Array for removed Quiz
      expect((adminUserALLDetails(token0.userId) as AdminUserALLDetails).user.deletedQuizzes[0].quizId).toEqual(quizId0);
      expect((adminUserALLDetails(token0.userId) as AdminUserALLDetails).user.deletedQuizzes[1].quizId).toEqual(quizId1);
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
      res = RequestRemoveQuiz(tokenToJwt(token0), quizId2 );
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
