import { AdminUserDetailsReturn, ErrorObj, Jwt, Token, AdminUserDetails } from '../../interfaces/interfaces';
import { objToJwt, tokenToJwt } from '../token';
// IMPORTING ALL WRAPPER FUNCTIONS
import { checkTokenValid, clearUsers, loginUser, logoutUserHandlerV2, registerUser, getUser, updateUserDetailsPassword, updateDetailsAuthHandler } from './testHelpers';

// TESTS FOR REGISTER //
beforeEach(() => {
  clearUsers();
});

afterEach(() => {
  clearUsers();
});


// TESTS FOR LOGOUT //
describe('Tests related to logging out an admin', () => {
  let jwt: Jwt;
  beforeEach(() => {
    const token = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    jwt = tokenToJwt(token);
  });

  describe('Unsuccessful Tests', () => {
    test('User already logged out', () => {
      const jwt2: Jwt = objToJwt({
        sessionId: '90343',
        userId: 5
      });

      expect(logoutUserHandlerV2(jwt2)).toEqual({
        error: 'User has already logged out'
      });

      logoutUserHandlerV2(jwt);

      expect(logoutUserHandlerV2(jwt)).toEqual({
        error: 'User has already logged out'
      });
    });

    test('Token is not a valid structure', () => {
      const jwt2: Jwt = objToJwt({
        something: '234903',
        bye: 8,
      });

      expect(logoutUserHandlerV2(jwt2)).toEqual({
        error: 'Token is not a valid structure'
      });

      expect(logoutUserHandlerV2({ token: 'Some JWT string' })).toEqual({
        error: 'Token is not a valid structure'
      });
    });
  });

  describe('Successful tests', () => {
    test('One user logged in at once', () => {
      expect(logoutUserHandlerV2(jwt)).toEqual({

      });
    });

    test('Multiple users logged in at once', () => {
      const token2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
      const jwt2 = tokenToJwt(token2);

      expect(logoutUserHandlerV2(jwt2)).toEqual({

      });

      expect(logoutUserHandlerV2(jwt)).toEqual({

      });
    });
  });
});
