import { AdminAuthRegister, Error } from '../../interfaces/interfaces';
import { clear } from '../other';
import request from 'sync-request';

beforeEach(() => {
  clear();
});

// Wrapper functions
function registerUser (email: string, password: string, nameFirst: string, nameLast:string): AdminAuthRegister | Error {
  const res = request(
    'POST',
    'http://localhost:3200/v1/admin/auth/register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  const authRegisterId: AdminAuthRegister | Error = JSON.parse(res.body.toString());
  return authRegisterId;
}

// TESTS //
describe('adminAuthRegister tests', () => {
  test('Check successful Register', () => {
    const authRegisterId: AdminAuthRegister | Error = registerUser('example@email.com', 'Password123', 'First', 'Last');
    expect(authRegisterId).toStrictEqual({ authUserId: 0 });
  });

  describe('Unsuccessful register - names', () => {
    test('Check unsuccessful first name - null input', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Password123', '', 'Jones');
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - using wrong characters', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Password123', 'Johnny-B345one', 'Jones');
      const expectedResult = {
        error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - wrong size', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Password123', 'J', 'Jones');
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - wrong size', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Password123', 'Jooooooooooooooooooooooooooonnnnnnnnyyyyyyy', 'Jones');
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - null input', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Password123', 'Johnny', '');
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - using wrong characters', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'Jo124143\'nes');
      const expectedResult = {
        error: 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - Wrong size', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'J');
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - Wrong size', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'joooooooooooooooooooooooonnnnnnnnnneeeeeeeeeeessssss');
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });
  });

  describe('Unsuccessful Register - password', () => {
    test('Check unsuccessful password - less then 8 characters', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Pas', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', '123456789', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', '', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'pyassword', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });
  });

  describe('Unsuccessful Register - email', () => {
    test('Check unsuccessful email - email not valid', () => {
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.emailgmail.com', 'Password123', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Email is not valid',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful email - email used already', () => {
      registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'Jones');
      const authRegisterId: AdminAuthRegister | Error = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Email already used',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });
  });
});
