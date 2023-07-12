import { ErrorObj, Jwt, Token } from '../../interfaces/interfaces';
import { objToJwt, tokenToJwt } from '../token';
import { checkTokenValid, clearUsers, loginUser, logoutUserHandler, registerUser } from './testHelpers';

beforeEach(() => {
  clearUsers();
});

describe('adminAuthRegister tests', () => {
  test('Check successful Register', () => {
    const res: Token | ErrorObj = registerUser('example@email.com', 'Password123', 'First', 'Last');
    expect(checkTokenValid(res as Token, 0)).toEqual(true);
  });

  describe('Unsuccessful register - names', () => {
    test('Check unsuccessful first name - null input', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Password123', '', 'Jones');
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - using wrong characters', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny-B345one', 'Jones');
      const expectedResult = {
        error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - wrong size', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'J', 'Jones');
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - wrong size', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Jooooooooooooooooooooooooooonnnnnnnnyyyyyyy', 'Jones');
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - null input', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', '');
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - using wrong characters', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'Jo124143\'nes');
      const expectedResult = {
        error: 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - Wrong size', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'J');
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - Wrong size', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'joooooooooooooooooooooooonnnnnnnnnneeeeeeeeeeessssss');
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      };
      expect(res).toStrictEqual(expectedResult);
    });
  });

  describe('Unsuccessful Register - password', () => {
    test('Check unsuccessful password - less then 8 characters', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Pas', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', '123456789', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', '', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'pyassword', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(res).toStrictEqual(expectedResult);
    });
  });

  describe('Unsuccessful Register - email', () => {
    test('Check unsuccessful email - email not valid', () => {
      const res: Token | ErrorObj = registerUser('good.emailgmail.com', 'Password123', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Email is not valid',
      };
      expect(res).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful email - email used already', () => {
      registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'Jones');
      const res: Token | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Email already used',
      };
      expect(res).toStrictEqual(expectedResult);
    });
  });
});

// TESTS FOR LOGIN //
describe('adminAuthLogin tests', () => {
  describe('Successful Login', () => {
    test('One user login', () => {
      const token: Token | ErrorObj = registerUser('goofy.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jones');
      const loginToken: Token | ErrorObj = loginUser('goofy.email@gmail.com', 'Password123');
      expect(token).toStrictEqual(loginToken);
    });
    test('Multiple user login', () => {
      registerUser('good.ail@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
      const token: Token | ErrorObj = registerUser('gooemail@gmail.com', 'Password121233', 'Joh nny-Bone', 'Jones');
      const token2: Token | ErrorObj = registerUser('gdemail@gmail.com', 'Password112315g23', 'Joh nny-Bone', 'Jones');
      const loginToken: Token | ErrorObj = loginUser('gooemail@gmail.com', 'Password121233');
      const loginToken2: Token | ErrorObj = loginUser('gdemail@gmail.com', 'Password112315g23');
      expect(token).toStrictEqual(loginToken);
      expect(token2).toStrictEqual(loginToken2);
    });
  });

  describe('Unsuccessful Login', () => {
    test('User does not exist', () => {
      registerUser('gooil@gmail.com', 'Password12sdf3', 'Joh nny-Bone', 'Jones');
      registerUser('mail@gmail.com', 'Password12sdf3', 'Joh nny-Bone', 'Jones');
      const res: Token | ErrorObj = loginUser('goyeama@gmail.com', 'Pasworadsa2d123');
      expect(res).toStrictEqual({ error: 'Username or Password is not valid' });
    });
    test('Wrong Email', () => {
      registerUser('good.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jones');
      const res: Token | ErrorObj = loginUser('good.ema@gmail.com', 'Password123');
      expect(res).toStrictEqual({ error: 'Username or Password is not valid' });
    });
    test('Wrong Password', () => {
      registerUser('good.ail@gmail.com', 'Password123', 'Joh nny-Bone', 'Jones');
      const res: Token | ErrorObj = loginUser('good.ail@gmail.com', 'Passw15g23');
      expect(res).toStrictEqual({ error: 'Username or Password is not valid' });
    });
  });
});

describe('clear tests', () => {
  test('Clearing users', () => {
    registerUser('email@gmail.com', 'Password123', 'Johnny', 'Jones');
    registerUser('emailllll@gmail.com', 'Password123', 'Johnny', 'Jones');
    clearUsers();
    const res: Token | ErrorObj = registerUser('email@gmail.com', 'Password123', 'Johnny', 'Jones');
    expect(checkTokenValid(res as Token, 0)).toEqual(true);
  });
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

      expect(logoutUserHandler(jwt2)).toEqual({
        error: 'User has already logged out'
      });

      logoutUserHandler(jwt);

      expect(logoutUserHandler(jwt)).toEqual({
        error: 'User has already logged out'
      });
    });

    test('Token is not a valid structure', () => {
      const jwt2: Jwt = objToJwt({
        something: '234903',
        bye: 8,
      });

      expect(logoutUserHandler(jwt2)).toEqual({
        error: 'Token is not a valid structure'
      });

      expect(logoutUserHandler({ token: 'Some JWT string' })).toEqual({
        error: 'Token is not a valid structure'
      });
    });
  });

  describe('Successful tests', () => {
    test('One user logged in at once', () => {
      expect(logoutUserHandler(jwt)).toEqual({

      });
    });

    test('Multiple users logged in at once', () => {
      const token2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
      const jwt2 = tokenToJwt(token2);

      expect(logoutUserHandler(jwt2)).toEqual({

      });

      expect(logoutUserHandler(jwt)).toEqual({

      });
    });
  });
});

export { registerUser, logoutUserHandler };
