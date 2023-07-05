// Clear Function Tests
import { clear } from '../other';
import { adminAuthLogin, adminAuthRegister, adminUserDetails } from '../auth';
import { adminQuizList, adminQuizRemove, adminQuizCreate, adminQuizNameUpdate, adminQuizDescriptionUpdate, adminQuizInfo } from '../quiz';
import { AdminAuthRegister, AdminQuizCreate } from '../../interfaces/interfaces';

describe('Clear tests', () => {
  test('Empty clear', () => {
    expect(clear()).toEqual({});
  });

  describe('Clear with admin related functionality', () => {
    let authUserId: number;

    beforeEach(() => {
      authUserId = (adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith') as AdminAuthRegister).authUserId;
    });

    test('Clear with one user', () => {
      expect(clear()).toEqual({});
      expect(adminAuthLogin('JohnSmith@gmail.com', 'password123')).toEqual({ error: 'Username or Password is not valid' });
      expect(adminUserDetails(authUserId)).toEqual({ error: 'User does not exists' });
    });

    test('Clear with multiple users', () => {
      const authUserId2 = (adminAuthRegister('JaneAusten@gmail.com', 'password133', 'Jane', 'Austen') as AdminAuthRegister).authUserId;

      expect(clear()).toEqual({});
      expect(adminAuthLogin('JohnSmith@gmail.com', 'password123')).toEqual({ error: 'Username or Password is not valid' });
      expect(adminUserDetails(authUserId)).toEqual({ error: 'User does not exists' });
      expect(adminAuthLogin('JaneAusten@gmail.com', 'password133')).toEqual({ error: 'Username or Password is not valid' });
      expect(adminUserDetails(authUserId2)).toEqual({ error: 'User does not exists' });
    });
  });

  describe('Clear with quiz related functionality', () => {
    let authUserId: number;
    let quizId: number;

    beforeEach(() => {
      authUserId = (adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith') as AdminAuthRegister).authUserId;
      quizId = (adminQuizCreate(authUserId, 'Countries of the World', 'Quiz on all Countries') as AdminQuizCreate).quizId;
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
      const authUserId2 = (adminAuthRegister('JaneAusten@gmail.com', 'password133', 'Jane', 'Austen') as AdminAuthRegister).authUserId;
      const quizId2 = (adminQuizCreate(authUserId2, 'Flags of the World', 'Quiz on all Flags') as AdminQuizCreate).quizId;

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
