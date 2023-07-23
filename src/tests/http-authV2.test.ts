import { AdminUserDetailsReturn, ErrorObj, Jwt, Token, AdminUserDetails } from '../../interfaces/interfaces';
import { objToJwt, tokenToJwt } from '../token';
// IMPORTING ALL WRAPPER FUNCTIONS
import { clearUsers, loginUser, registerUser } from './iter2tests/testHelpersv1';
import { getUserV2, logoutUserHandlerV2, updateDetailsAuthHandlerV2, updateUserDetailsPasswordV2 } from './testhelpersV2';

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

// TESTS FOR ADMIN USER DETAILS //
describe('adminUserDetailsV2 test', () => {
  let jwt: Jwt;
  beforeEach(() => {
    const token = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    jwt = tokenToJwt(token);
  });

  describe('Unsuccessful retrieval of user details', () => {
    test('User does not exist', () => {
      const jwt2: Token = {
        sessionId: '',
        userId: 12,
      };
      const userDetails = getUserV2(tokenToJwt(jwt2)) as ErrorObj;
      const expectedResult: ErrorObj = { error: 'Token not for currently logged in session' };
      expect(userDetails).toStrictEqual(expectedResult);
    });
  });

  describe('Successful retrieval of user details', () => {
    test('User logged in with no fail (Register counts as successful login)', () => {
      loginUser('JohnSmith@gmail.com', 'Password123');
      const expectedResult: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUserV2(jwt)).toStrictEqual(expectedResult);
    });

    test('User logged in with multiple fails', () => {
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password123');
      const expectedResult: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUserV2(jwt)).toStrictEqual(expectedResult);
    });

    test('Multple users created and multiple users failed login', () => {
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password123');
      const expectedResult1: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUserV2(jwt)).toStrictEqual(expectedResult1);

      const token2 = registerUser('Connor@gmail.com', 'Password123', 'Connor', 'Mcgregor') as Token;
      const jwt2: Jwt = tokenToJwt(token2);
      loginUser('Connor@gmail.com', 'Password12');
      loginUser('Connor@gmail.com', 'Password12');
      loginUser('Connor@gmail.com', 'Password12');
      loginUser('Connor@gmail.com', 'Password123');
      const expectedResult2: AdminUserDetailsReturn = { user: { userId: 1, name: 'Connor Mcgregor', email: 'Connor@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUserV2(jwt2)).toStrictEqual(expectedResult2);

      const token3 = registerUser('John@gmail.com', 'Password123', 'John', 'Cena') as Token;
      const jwt3: Jwt = tokenToJwt(token3);
      loginUser('John@gmail.com', 'Password12');
      loginUser('John@gmail.com', 'Password12');
      loginUser('John@gmail.com', 'Password12');
      loginUser('John@gmail.com', 'Password123');
      const expectedResult3: AdminUserDetailsReturn = { user: { userId: 2, name: 'John Cena', email: 'John@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUserV2(jwt3)).toStrictEqual(expectedResult3);
    });

    test('User successfully registers but unable to login', () => {
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      const expectedResult: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 4 } };
      expect(getUserV2(jwt)).toStrictEqual(expectedResult);
    });

    test('User successfully registers but unable to login', () => {
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      const expectedResult: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 4 } };
      expect(getUserV2(jwt)).toStrictEqual(expectedResult);
    });
  });
});

// TEST FOR ADMIN USER UPDATE DETAILS //
describe('adminUserUpdateDetailsV2 test', () => {
  let jwt: Jwt;
  beforeEach(() => {
    const token = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    jwt = tokenToJwt(token);
  });

  describe('Unseccessful update of details', () => {
    test('Token does not exit', () => {
      const jwt2: Token = {
        sessionId: '4',
        userId: 12,
      };
      const userDetails = getUserV2(tokenToJwt(jwt2)) as ErrorObj;
      const expectedResult: ErrorObj = { error: 'Token not for currently logged in session' };
      expect(userDetails).toStrictEqual(expectedResult);
    });
    test('Email is not valid', () => {
      const change = updateDetailsAuthHandlerV2(jwt, 'JohnSmith123gmail.com', 'Johnny', 'Smithy');
      expect(change).toStrictEqual({ error: 'Invalid email or email is already in use' });
    });
    test('First name is not valid', () => {
      const change = updateDetailsAuthHandlerV2(jwt, 'JohnSmith123@gmail.com', 'Johnny123', 'Smithy');
      expect(change).toStrictEqual({ error: 'Name can only contain alphanumeric symbols' });
    });
    test('Last Name is not valid', () => {
      const change = updateDetailsAuthHandlerV2(jwt, 'JohnSmith123@gmail.com', 'Johnny', 'S');
      expect(change).toStrictEqual({ error: 'Invalid last name' });
    });
  });

  describe('Successful Update of details', () => {
    test('All sections are successfully updated', () => {
      const change = updateDetailsAuthHandlerV2(jwt, 'JohnSmith321@gmail.com', 'Johnny', 'Smithy');
      expect(change).toStrictEqual({});
      const details = getUserV2(jwt) as AdminUserDetails;
      expect(details.user.email).toStrictEqual('JohnSmith321@gmail.com');
    });
  });
});

// TESTS FOR ADMIN USER PASSWORD UPDATE //
describe('adminUserUpdateDetailsPassword test', () => {
  let jwt: Jwt;

  describe('Unseccessful update of Password', () => {
    beforeEach(() => {
      const token = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
      jwt = tokenToJwt(token);
    });

    test('Token does not exit', () => {
      const jwt2: Token = {
        sessionId: '4',
        userId: 12,
      };
      const change = updateUserDetailsPasswordV2(tokenToJwt(jwt2), 'Password123', 'Password1234');
      expect(change).toStrictEqual({ error: 'Token is not for currently logged in session' });
    });
    test('Password does not match with old password', () => {
      const change = updateUserDetailsPasswordV2(jwt, 'Password12', 'Password1234');
      expect(change).toStrictEqual({ error: 'Old password is not correct' });
    });
    test('Password does not match with criteria', () => {
      const change = updateUserDetailsPasswordV2(jwt, 'Password123', 'P4');
      expect(change).toStrictEqual({ error: 'New password must be at least 8 characters long and contain at least one number and one letter' });
    });
    test('Password has already been used', () => {
      const change = updateUserDetailsPasswordV2(jwt, 'Password123', 'Password123');
      expect(change).toStrictEqual({ error: 'New password cannot be the same as the old password' });
    });

    test('Password has already been used', () => {
      updateUserDetailsPasswordV2(jwt, 'Password123', 'Password321');
      const change = updateUserDetailsPasswordV2(jwt, 'Password321', 'Password123');
      expect(change).toStrictEqual({ error: 'New password cannot be the same as the old password' });
    });
  });

  describe('Successful Update of Password', () => {
    test('Password has been changed successfully', () => {
      const token = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
      jwt = tokenToJwt(token);

      const change = updateUserDetailsPasswordV2(jwt, 'Password123', 'Password1234');
      expect(change).toStrictEqual({});
    });
  });
});
