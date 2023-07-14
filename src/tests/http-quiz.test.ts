import { ErrorObj, Token, AdminQuizCreate, OkObj, Jwt, AdminQuizInfo, AdminQuizList, QuizTrashReturn } from '../../interfaces/interfaces';
import { registerUser, logoutUserHandler } from './http-auth.test';
import { tokenToJwt } from '../token';
import { RequestCreateQuiz, RequestRemoveQuiz, clearUsers, listQuiz, updateNameQuiz, infoQuiz, quizTransferHandler, updateDescriptionQuiz, viewQuizTrashHandler, trashRestoreQuizHandler } from './testHelpers';

beforeEach(() => {
  clearUsers();
});
// TESTS FOR QUIZ UPDATE DESCRIPTION //
describe('Quiz Update Description', () => {
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
    quizId0 = (RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuiz(tokenToJwt(token1), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
  });

  describe('Successful test', () => {
    beforeEach(() => {
      quizEditedTime = Math.round(Date.now() / 1000);
      res = updateDescriptionQuiz(tokenToJwt(token0), 'Updated description', quizId0) as OkObj;
      quizInfo = infoQuiz(tokenToJwt(token0), quizId0) as AdminQuizInfo;
    });

    test('1. Updates the name of an existing quiz', () => {
      expect(quizInfo.description).toStrictEqual('Updated description');
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
      res = updateDescriptionQuiz(tokenToJwt(token0), 'Updated description', -9);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('2. Quiz ID does not refer to a quiz that this user owns', () => {
      res = updateDescriptionQuiz(tokenToJwt(token0), 'Updated description', quizId1);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('3.Description is more than 100 characters in length', () => {
      res = updateDescriptionQuiz(tokenToJwt(token0), 'This is a description that is more than 100 characters long. It should trigger an error. ?!@ #$& *%)_@ ;-))1', quizId0);
      expect(res).toStrictEqual({ error: 'Description must be under 100 characters' });
    });

    test('6. Token is not a valid structure', () => {
      res = res = updateDescriptionQuiz({ token: '-1' }, 'Updated description', quizId0);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });

    test('7. Not token of an active session', () => {
      logoutUserHandler(tokenToJwt(token1));
      res = updateDescriptionQuiz(tokenToJwt(token1), 'Updated description', quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });
});

// TESTS FOR QUIZ UPDATE NAME //
describe('Quiz Update Name', () => {
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
    quizId0 = (RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuiz(tokenToJwt(token1), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
  });
  describe('Successful test', () => {
    beforeEach(() => {
      quizEditedTime = Math.round(Date.now() / 1000);
      res = updateNameQuiz(tokenToJwt(token0), 'Quiz 0 Updated', quizId0) as OkObj;
      quizInfo = infoQuiz(tokenToJwt(token0), quizId0) as AdminQuizInfo;
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
      res = updateNameQuiz(tokenToJwt(token0), 'Quiz 0 Updated', -9);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('2. Quiz ID does not refer to a quiz that this user owns', () => {
      res = updateNameQuiz(tokenToJwt(token0), 'Quiz 1 Updated', quizId1);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('3. Non alphanumeric name entered', () => {
      res = updateNameQuiz(tokenToJwt(token0), '~ Quiz 0 Updated ~', quizId0);
      expect(res).toStrictEqual({ error: 'Must use only alphanumeric characters or spaces in name' });
    });

    test('4. Less than 3 characters', () => {
      res = updateNameQuiz(tokenToJwt(token0), 'hi', quizId0);
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('5. More than 30 characters', () => {
      res = updateNameQuiz(tokenToJwt(token0), 'abcdefghijklmnopqrstuvwxyz12345', quizId0);
      expect(res).toStrictEqual(
        { error: 'Name must be between 3 and 30 characters' });
    });

    test('6. Name already used by same user', () => {
      updateNameQuiz(tokenToJwt(token0), 'Quiz 0 Updated', quizId0);
      res = updateNameQuiz(tokenToJwt(token0), 'Quiz 0 Updated', quizId0);
      expect(res).toStrictEqual({ error: 'Quiz name is already in use' });
    });

    test('7. Token is not a valid structure', () => {
      res = updateNameQuiz({ token: '-1' }, 'Quiz 0 Updated', quizId0);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });

    test('8. Not token of an active session', () => {
      logoutUserHandler(tokenToJwt(token1));
      res = updateNameQuiz(tokenToJwt(token1), 'Quiz 1 Updated', quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });
});

// TESTS FOR QUIZ INFO //
describe('Quiz Info', () => {
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
      res = infoQuiz(tokenToJwt(token0), quizId0) as AdminQuizInfo;
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
      res = infoQuiz(tokenToJwt(token0), quizId0) as AdminQuizInfo;
      res0 = infoQuiz(tokenToJwt(token0), quizId1) as AdminQuizInfo;

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
      res = infoQuiz(tokenToJwt(token0), -99);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('2. Quiz ID does not refer to a quiz that this user owns', () => {
      res = infoQuiz(tokenToJwt(token0), quizId2);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
    test('3. Not token of an active session', () => {
      res = infoQuiz(tokenToJwt(token1), quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Token is not a valid structure', () => {
      res = infoQuiz({ token: '-1' }, quizId1);
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

describe('Quiz Transfer', () => {
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
    quizId = (RequestCreateQuiz(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
  });

  describe('Unsuccessful Tests', () => {
    test('Quiz ID does not refer to a valid quiz', () => {
      expect(quizTransferHandler(userJwt, 'JaneAusten@gmail.com', quizId + 1)).toEqual(
        { error: 'Quiz ID does not refer to a valid quiz' }
      );
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      expect(quizTransferHandler(userJwt2, 'JaneAusten@gmail.com', quizId)).toEqual(
        { error: 'Quiz ID does not refer to a quiz that this user owns' }
      );
    });

    test('Email is not a real user', () => {
      expect(quizTransferHandler(userJwt2, 'JaneAusten@gmail.com', quizId)).toEqual(
        { error: 'Quiz ID does not refer to a quiz that this user owns' }
      );
    });

    test('Email is not currently a logged in user', () => {
      expect(quizTransferHandler(userJwt, 'JohnSmith@gmail.com', quizId)).toEqual(
        { error: 'userEmail is the current logged in user' }
      );
    });

    test('Quiz name is already used by user', () => {
      RequestCreateQuiz(userJwt2, 'Countries of the world', 'Quiz on all countries V2');
      expect(quizTransferHandler(userJwt, 'JaneAusten@gmail.com', quizId)).toEqual({
        error: 'Quiz ID refers to a quiz that has a name that is already used by the target user'
      });
    });
  });

  describe('Successful Tests', () => {
    test('Single quiz transfer', () => {
      expect(quizTransferHandler(userJwt, 'JaneAusten@gmail.com', quizId)).toEqual({});
    });

    test('Multiple Quiz Transfers with Multiple Quizzes', () => {
      const quizId2 = (RequestCreateQuiz(userJwt2, 'Flags of the world', 'Flags on all countries') as AdminQuizCreate).quizId;
      expect(quizTransferHandler(userJwt, 'JaneAusten@gmail.com', quizId)).toEqual({});
      expect(quizTransferHandler(userJwt2, 'JohnSmith@gmail.com', quizId)).toEqual({});
      expect(quizTransferHandler(userJwt2, 'JohnSmith@gmail.com', quizId2)).toEqual({});
    });
  });
});

describe('View Quiz Trash', () => {
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
    quizId = (RequestCreateQuiz(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
  });

  describe('Unsuccessful tests', () => {
    test('Invalid token structure', () => {
      expect(viewQuizTrashHandler({ token: '0' })).toEqual({
        error: 'Token is not a valid structure'
      });
    });

    test('Token is not logged in', () => {
      logoutUserHandler(userJwt);
      expect(viewQuizTrashHandler(userJwt)).toEqual({
        error: 'Provided token is valid structure, but is not for a currently logged in session'
      });
    });
  });

  describe('Successful tests', () => {
    test('Empty Trash', () => {
      expect(viewQuizTrashHandler(userJwt)).toEqual({
        quizzes: []
      });

      expect(viewQuizTrashHandler(userJwt2)).toEqual({
        quizzes: []
      });
    });

    test('Non empty trash', () => {
      const quizId2 = (RequestCreateQuiz(userJwt2, 'Flags of the world', 'Flags on all countries') as AdminQuizCreate).quizId;

      RequestRemoveQuiz(userJwt, quizId);
      expect(viewQuizTrashHandler(userJwt)).toEqual({
        quizzes: [
          {
            quizId: quizId,
            name: 'Countries of the world'
          }
        ]
      });

      RequestRemoveQuiz(userJwt2, quizId2);

      expect(viewQuizTrashHandler(userJwt2)).toEqual({
        quizzes: [
          {
            quizId: quizId2,
            name: 'Flags of the world'
          }
        ]
      });
    });
  });
});

// TESTS FOR TRASH RESTORE //
describe('Trash Restore Quiz', () => {
  let userJwt: Jwt;
  let userJwt2: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let quizId: number;
  let quizId2: number;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
    userJwt2 = tokenToJwt(userToken2);
    quizId = (RequestCreateQuiz(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuiz(userJwt2, 'Flags of the world', 'Flags on all countries') as AdminQuizCreate).quizId;
    RequestRemoveQuiz(userJwt2, quizId2);
  });

  describe('Unsuccessful tests', () => {
    test('Token is not a valid structure', () => {
      expect(trashRestoreQuizHandler({ token: 'some token' }, quizId2)).toEqual({
        error: 'Token is not a valid structure'
      });
    });

    test('User is not logged in', () => {
      logoutUserHandler(userJwt2);
      expect(trashRestoreQuizHandler(userJwt2, quizId2)).toEqual({
        error: 'Provided token is valid structure, but is not for a currently logged in session'
      });
    });

    test('Quiz ID is invalid', () => {
      expect(trashRestoreQuizHandler(userJwt, quizId + 5)).toEqual({
        error: 'Quiz ID does not refer to a valid quiz'
      });
    });

    test('Quiz ID does not refer to a valid quiz that the user owns', () => {
      expect(trashRestoreQuizHandler(userJwt2, quizId)).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns'
      });
    });

    test('Quiz ID refers to quiz not currently in trash', () => {
      expect(trashRestoreQuizHandler(userJwt, quizId)).toEqual({
        error: 'Quiz ID refers to a quiz that is not currently in the trash'
      });
    });
  });

  describe('Successful tests', () => {
    test('Restoring 1 quiz', () => {
      expect(trashRestoreQuizHandler(userJwt2, quizId2)).toEqual({});
      expect(viewQuizTrashHandler(userJwt2)).toEqual({
        quizzes: []
      });
    });

    test('Restoring multiple quizzes', () => {
      RequestRemoveQuiz(userJwt, quizId);
      expect(trashRestoreQuizHandler(userJwt2, quizId2)).toEqual({});
      expect(trashRestoreQuizHandler(userJwt, quizId)).toEqual({});

      expect(viewQuizTrashHandler(userJwt)).toEqual({
        quizzes: []
      });

      expect(viewQuizTrashHandler(userJwt2)).toEqual({
        quizzes: []
      });
    });
  });
});

// TESTS FOR ALL QUIZ FUNCTION INTERACTIONS TOGETHER //
test('Test for all Quiz', () => {
  // make 2 quizzes for token0
  const token0: Token = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
  const token1: Token = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
  const quizId0: number = (RequestCreateQuiz(tokenToJwt(token0), 'Quiz0', 'Description0') as AdminQuizCreate).quizId;
  const quizId1: number = (RequestCreateQuiz(tokenToJwt(token0), 'Quiz1', 'Description1') as AdminQuizCreate).quizId;
  expect(quizId0).toStrictEqual(0);
  expect(quizId1).toStrictEqual(1);

  // view trash that should be empty
  let trash0 = viewQuizTrashHandler(tokenToJwt(token0)) as QuizTrashReturn;
  expect(trash0).toStrictEqual({
    quizzes: []
  });

  // remove quizId0
  RequestRemoveQuiz(tokenToJwt(token0), quizId0);

  // view trash should have quizId0 in it
  trash0 = viewQuizTrashHandler(tokenToJwt(token0)) as QuizTrashReturn;
  expect(trash0).toEqual(
    {
      quizzes: [
        {
          quizId: quizId0,
          name: 'Quiz0'
        }
      ]
    }
  );

  // TO DO ///////////////////
  // restore quiz0 from trash
  trashRestoreQuizHandler(tokenToJwt(token0), quizId0);

  // transfer quiz1
  quizTransferHandler(tokenToJwt(token0), 'JoeMama@gmail.com', quizId1);

  // check if it worked on both sides using quizlist
  const list0 = listQuiz(tokenToJwt(token0)) as AdminQuizList;
  expect(list0).toStrictEqual(
    {
      quizzes: [
        {
          quizId: quizId0,
          name: 'Quiz0'
        }
      ]
    }
  );

  const list1 = listQuiz(tokenToJwt(token1)) as AdminQuizList;
  expect(list1).toStrictEqual(
    {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Quiz1'
        }
      ]
    }
  );
});
