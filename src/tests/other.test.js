// Clear Function Tests
import { clear } from '../other.js';
import { adminAuthLogin, adminAuthRegister, adminUserDetails } from '../auth.js';
import { adminQuizList, adminQuizRemove, adminQuizCreate, adminQuizNameUpdate, adminQuizDescriptionUpdate, adminQuizInfo } from '../quiz.js';

describe('Clear tests', () => {
  test('Empty clear', () => {
    expect(clear()).toEqual({});
  });

  describe('Clear with admin related functionality', () => {
    let authUserId;

    beforeEach(() => {
      authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
    });

    test('Clear with one user', () => {
      expect(clear()).toEqual({});
      expect(adminAuthLogin('JohnSmith@gmail.com', 'password123')).toEqual({ error: 'Username or Password is not valid' });
      expect(adminUserDetails(authUserId)).toEqual({ error: 'User does not exists' });
    });

    test('Clear with multiple users', () => {
      const authUserId2 = adminAuthRegister('JaneAusten@gmail.com', 'password133', 'Jane', 'Austen').authUserId;

      expect(clear()).toEqual({});
      expect(adminAuthLogin('JohnSmith@gmail.com', 'password123')).toEqual({ error: 'Username or Password is not valid' });
      expect(adminUserDetails(authUserId)).toEqual({ error: 'User does not exists' });
      expect(adminAuthLogin('JaneAusten@gmail.com', 'password133')).toEqual({ error: 'Username or Password is not valid' });
      expect(adminUserDetails(authUserId2)).toEqual({ error: 'User does not exists' });
    });
  });

  describe('Clear with quiz related functionality', () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
      quizId = adminQuizCreate(authUserId, 'Countries of the World', 'Quiz on all Countries').quizId;
    });

    test('Clear with one quiz creation', () => {
      expect(clear()).toEqual({});

      expect(adminQuizList(authUserId)).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizRemove(authUserId, quizId)).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizInfo(authUserId, quizId)).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizNameUpdate(authUserId, quizId, ' ')).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizDescriptionUpdate(authUserId, quizId, ' ')).toEqual({ error: 'AuthUserId is not a valid user' });
    });

    test('Clear with multiple quiz creations', () => {
      const authUserId2 = adminAuthRegister('JaneAusten@gmail.com', 'password133', 'Jane', 'Austen').authUserId;
      const quizId2 = adminQuizCreate(authUserId2, 'Flags of the World', 'Quiz on all Flags').quizId;

      expect(clear()).toEqual({});

      expect(adminQuizList(authUserId)).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizRemove(authUserId, quizId)).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizInfo(authUserId, quizId)).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizNameUpdate(authUserId, quizId, ' ')).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizDescriptionUpdate(authUserId, quizId, ' ')).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizList(authUserId2)).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizRemove(authUserId2, quizId2)).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizInfo(authUserId2, quizId2)).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizNameUpdate(authUserId2, quizId2, ' ')).toEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizDescriptionUpdate(authUserId2, quizId2, ' ')).toEqual({ error: 'AuthUserId is not a valid user' });
    });
  });
});
