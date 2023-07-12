import { AdminUserDetailsReturn, ErrorObj, Jwt, OkObj, Token } from '../../interfaces/interfaces';
import request from 'sync-request';
import { getUrl } from '../helper';
import { jwtToToken, objToJwt, tokenToJwt } from '../token';
import { checkTokenValid } from './testHelpers';
import { TokenClass } from 'typescript';

const URL: string = getUrl();

// Wrapper functions
const registerUser = (email: string, password: string, nameFirst: string, nameLast:string): Token | ErrorObj => {
  const res = request(
    'POST',
    URL + 'v1/admin/auth/register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  const parsedResponse: Jwt | ErrorObj = JSON.parse(res.body.toString());

  if ('error' in parsedResponse) {
    return parsedResponse;
  } else {
    return jwtToToken(parsedResponse);
  }
};

const loginUser = (email: string, password: string): Token | ErrorObj => {
  const res = request(
    'POST',
    URL + 'v1/admin/auth/login',
    {
      json: {
        email: email,
        password: password,
      }
    }
  );

  const parsedResponse: Jwt | ErrorObj = JSON.parse(res.body.toString());

  if ('error' in parsedResponse) {
    return parsedResponse;
  } else {
    return jwtToToken(parsedResponse);
  }
};

const getUser = (jwt: Jwt): AdminUserDetailsReturn | ErrorObj => {
  const authUserId: number = jwtToToken(jwt).userId; 
  const res = request(
    'GET',
    URL + 'v1/admin/user/details',
    {
      json: {
        authUserId: authUserId
      }
    }
  );
  const parsedResponse: AdminUserDetailsReturn | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

function clearUsers (): void {
  request(
    'DELETE',
    URL + 'v1/clear'
  );
}

const logoutUserHandler = (jwt: Jwt) => {
  const res = request(
    'POST',
    URL + 'v1/admin/auth/logout',
    {
      json: {
        token: jwt.token
      }
    }
  );

  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// TESTS FOR REGISTER //

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

// TESTS FOR ADMIN USER DETAILS //
describe('adminUserDetails test', () => {
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
      }
      const userDetails = getUser(tokenToJwt(jwt2)) as ErrorObj;
      const expectedResult: ErrorObj = {error: 'Token not for currently logged in session'};
      expect(userDetails).toStrictEqual(expectedResult);
    });
  });

  describe('Successful retrieval of user details', () => {
    test('User logged in with no fail (Register counts as successful login)', () => {
      loginUser('JohnSmith@gmail.com', 'Password123');
      const expectedResult: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUser(jwt)).toStrictEqual(expectedResult);
    });

    test('User logged in with multiple fails', () => {
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password123');
      const expectedResult: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUser(jwt)).toStrictEqual(expectedResult);
    });

    test('Multple users created and multiple users failed login', () => {
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password123');
      const expectedResult1: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUser(jwt)).toStrictEqual(expectedResult1);

      const token2 = registerUser('Connor@gmail.com', 'Password123', 'Connor', 'Mcgregor') as Token;
      let jwt2: Jwt = tokenToJwt(token2);
      loginUser('Connor@gmail.com', 'Password12');
      loginUser('Connor@gmail.com', 'Password12');
      loginUser('Connor@gmail.com', 'Password12');
      loginUser('Connor@gmail.com', 'Password123');
      const expectedResult2: AdminUserDetailsReturn = { user: { userId: 0, name: 'Connor Mcgregor', email: 'Connor@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUser(jwt2)).toStrictEqual(expectedResult2);

      const token3 = registerUser('John@gmail.com', 'Password123', 'John', 'Cena') as Token;
      let jwt3: Jwt = tokenToJwt(token3);
      loginUser('John@gmail.com', 'Password12');
      loginUser('John@gmail.com', 'Password12');
      loginUser('John@gmail.com', 'Password12');
      loginUser('John@gmail.com', 'Password123');
      const expectedResult3: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Cena', email: 'John@gmail.com', numSuccessfulLogins: 2, numFailedPasswordsSinceLastLogin: 0 } };
      expect(getUser(jwt3)).toStrictEqual(expectedResult3);
    });

    test('User successfully registers but unable to login', () => {
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      const expectedResult: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 4 } };
      expect(getUser(jwt)).toStrictEqual(expectedResult);
    });

    test('User successfully registers but unable to login', () => {
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      loginUser('JohnSmith@gmail.com', 'Password12');
      const expectedResult: AdminUserDetailsReturn = { user: { userId: 0, name: 'John Smith', email: 'JohnSmith@gmail.com', numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 4 } };
      expect(getUser(jwt)).toStrictEqual(expectedResult);
    });
  });
});

export { registerUser, logoutUserHandler };
