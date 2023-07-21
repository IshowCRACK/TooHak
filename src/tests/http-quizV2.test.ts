import { ErrorObj, Token, AdminQuizCreate, OkObj, Jwt, AdminQuizInfo } from '../../interfaces/interfaces';
import { tokenToJwt } from '../token';
import { registerUser, logoutUserHandler, RequestCreateQuiz, RequestRemoveQuiz, clearUsers, listQuiz, updateNameQuiz, infoQuiz, quizTransferHandler, updateDescriptionQuiz, viewQuizTrashHandler, trashRestoreQuizHandler, emptyTrashHandler } from './testHelpers';

beforeEach(() => {
  clearUsers();
});

afterEach(() => {
  clearUsers();
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
      RequestCreateQuiz(jwt, 'Countries of the world', 'Quiz on all countries');
      expect(listQuizV2(jwt)).toStrictEqual({ quizzes: [{ quizId: 0, name: 'Countries of the world' }] });
    });

    test('User with multiple owned quizzes', () => {
      RequestCreateQuiz(jwt, 'Countries of the world', 'Quiz on all countries');
      RequestCreateQuiz(jwt, 'Flags of the world', 'Quiz on all flags');
      expect(listQuizV2(jwt)).toStrictEqual({ quizzes: [{ quizId: 0, name: 'Countries of the world' }, { quizId: 1, name: 'Flags of the world' }] });
    });
  });
});
