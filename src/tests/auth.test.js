import { adminAuthLogin, adminAuthRegister, adminUserDetails } from '../auth.js';
import { clear } from '../other.js';
import request from 'sync-request';

beforeEach(() => {
  clear();
});

describe('adminAuthLogin tests', () => {
  test('Check successful Register', () => {
    const res = request(
      'POST',
      'http://localhost:3200/v1/admin/auth/register',
      {
        json: {
          email: 'example@email.com',
          password: '12345678aB',
          nameFirst: 'First',
          nameLast: 'Last',
        }
      }
    )
    const bodyobj = JSON.parse(res.body.toString());
    const expectedResult = {
      authUserId: 0,
    }
    expect(bodyobj).toStrictEqual(expectedResult);
  });

  describe('Unsuccessful register - names', () => {
    test('Check unsuccessful first name - null input', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: '',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - using wrong characters', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: 'Johnny-B345one',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - wrong size', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: 'J',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - wrong size', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: 'Jooooooooooooooooooooooooooonnnnnnnnyyyyyyy',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - null input', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: 'Joh nny-Bone',
            nameLast: '',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - using wrong', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'Jo124143\'nes',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - Wrong size', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'j',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - Wrong size', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'joooooooooooooooooooooooonnnnnnnnnneeeeeeeeeeessssss',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });
  });

  describe('Unsuccessful Register - password', () => {
    test('Check unsuccessful password - less then 8 characters', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Pas',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: '123456789',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: '',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'pyassword',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });
  });

  

  describe('Unsuccessful Register - email', () => {
    test('Check unsuccessful email - email not valid', () => {
      const res = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.emailgmail.com',
            password: 'Password123',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res.body.toString());
      const expectedResult = {
        error: 'Email is not valid',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful email - email used already', () => {
      const res1 = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'Jones',
          }
        }
      )
      const res2 = request(
        'POST',
        'http://localhost:3200/v1/admin/auth/register',
        {
          json: {
            email: 'good.email@gmail.com',
            password: 'Password123',
            nameFirst: 'Joh nny-Bone',
            nameLast: 'Jones',
          }
        }
      )
      const bodyobj = JSON.parse(res2.body.toString());
      const expectedResult = {
        error: 'Email already used',
      }
      expect(bodyobj).toStrictEqual(expectedResult);
    });
  });
});

describe('adminAuthLogin tests', () => {
  describe('Successful Login', () => {
    test('One user login', () => {
      const authUserId = adminAuthRegister('goofy.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
      const authUserIdLogin = adminAuthLogin('goofy.email@gmail.com', 'Password123');
      expect(authUserId).toStrictEqual(authUserIdLogin);
    });
    test('Multiple user login', () => {
      adminAuthRegister('good.ail@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
      const authUserId = adminAuthRegister('gooemail@gmail.com', 'Password121233', 'Joh nny-Bone', 'Jo\'nes');
      const authUserId2 = adminAuthRegister('gdemail@gmail.com', 'Password112315g23', 'Joh nny-Bone', 'Jo\'nes');
      const authUserIdLogin = adminAuthLogin('gooemail@gmail.com', 'Password121233');
      const authUserIdLogin2 = adminAuthLogin('gdemail@gmail.com', 'Password112315g23');
      expect(authUserId).toStrictEqual(authUserIdLogin);
      expect(authUserId2).toStrictEqual(authUserIdLogin2);
    });
  });

  describe('Unsuccessful Login', () => {
    test('User does not exist', () => {
      adminAuthRegister('gooil@gmail.com', 'Password12sdf3', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthRegister('mail@gmail.com', 'Password12sdf3', 'Joh nny-Bone', 'Jo\'nes');
      const authUserIdLogin = adminAuthLogin('goyeama@gmail.com', 'Pasworadsa2d123');
      expect(authUserIdLogin).toStrictEqual({ error: 'Username or Password is not valid' });
    });
    test('Wrong Email', () => {
      adminAuthRegister('good.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
      const authUserIdLogin = adminAuthLogin('good.ema@gmail.com', 'Password123');
      expect(authUserIdLogin).toStrictEqual({ error: 'Username or Password is not valid' });
    });
    test('Wrong Password', () => {
      adminAuthRegister('good.ail@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
      const authUserIdLogin = adminAuthLogin('good.ail@gmail.com', 'Passw15g23');
      expect(authUserIdLogin).toStrictEqual({ error: 'Username or Password is not valid' });
    });
  });
});

describe('adminUserDetails test', () => {
  describe('Unsuccessful retrieval of user details', () => {
    test('User does not exists', () => {
      const authUserId = adminAuthRegister('gdemail@gmail.com', 'Password112315g23', 'Joh nny-Bone', 'Jo\'nes').authUserId;
      expect(adminUserDetails(authUserId + 1)).toStrictEqual({ error: 'User does not exists' });
    });
  });

  describe('Successful retrieval of user details', () => {
    test('User who has logged in without fail, (register counts as 1 successful login)', () => {
      const authUserId = adminAuthRegister('goofy.email@gmail.com', 'Password123', 'Pop', 'Smoke').authUserId;
      adminAuthLogin('goofy.email@gmail.com', 'Password123');
      const userDetails = adminUserDetails(authUserId);
      expect(userDetails).toMatchObject({
        user: {
          userId: 0,
          name: 'Pop Smoke',
          email: 'goofy.email@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0
        }
      });
    });

    test('One user who logged in with multiple fails', () => {
      const authUserId = adminAuthRegister('g1oofy.email@gmail.com', 'Password123', 'Pop', 'Smoke').authUserId;
      adminAuthLogin('g1oofy.email@gmail.com', 'Password12');
      adminAuthLogin('g1oofy.email@gmail.com', 'Password12');
      adminAuthLogin('g1oofy.email@gmail.com', 'Password12');
      adminAuthLogin('g1oofy.email@gmail.com', 'Password123');
      const userDetails = adminUserDetails(authUserId);
      expect(userDetails).toMatchObject({
        user: {
          userId: 0,
          name: 'Pop Smoke',
          email: 'g1oofy.email@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });

    test('Multiple users created and and multiple user who has failed multiple times', () => {
      const authUserId = adminAuthRegister('good.ail@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes').authUserId;
      const authUserId2 = adminAuthRegister('gooemail@gmail.com', 'Password121233', 'Joh nny-Bone', 'Jo\'nes').authUserId;
      const authUserId3 = adminAuthRegister('gdemail@gmail.com', 'Password112315g23', 'Joh nny-Bone', 'Jo\'nes').authUserId;

      adminAuthLogin('good.ail@gmail.com', 'Pas13ord123', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('good.ail@gmail.com', 'Pas13ord123', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('good.ail@gmail.com', 'Pas13ord123', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('good.ail@gmail.com', 'Pas13ord123', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('good.ail@gmail.com', 'Pas13ord123', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('good.ail@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
      const userDetails = adminUserDetails(authUserId);
      expect(userDetails).toMatchObject({
        user: {
          userId: 0,
          name: 'Joh nny-Bone Jo\'nes',
          email: 'good.ail@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0
        }
      });

      adminAuthLogin('gooemail@gmail.com', 'Passsword121233', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('gooemail@gmail.com', 'Passwosrd121233', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('gooemail@gmail.com', 'Password121233', 'Joh nny-Bone', 'Jo\'nes');
      const userDetails2 = adminUserDetails(authUserId2);
      expect(userDetails2).toMatchObject({
        user: {
          userId: 1,
          name: 'Joh nny-Bone Jo\'nes',
          email: 'gooemail@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0
        }
      });

      adminAuthLogin('gdemail@gmail.com', 'Passwrd112315g23', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('gdemail@gmail.com', 'Password112315g23', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('gdemail@gmail.com', 'Password112315g23', 'Joh nny-Bone', 'Jo\'nes');
      adminAuthLogin('gdemail@gmail.com', 'Password112315g23', 'Joh nny-Bone', 'Jo\'nes');
      const userDetails3 = adminUserDetails(authUserId3);
      expect(userDetails3).toMatchObject({
        user: {
          userId: 2,
          name: 'Joh nny-Bone Jo\'nes',
          email: 'gdemail@gmail.com',
          numSuccessfulLogins: 4,
          numFailedPasswordsSinceLastLogin: 0
        }
      });
    });
  });
  test('User successfully registers but unable to login', () => {
    const authUserId = adminAuthRegister('goo4email@gmail.com', 'Password121233', 'Joh nny-Bone', 'Jo\'nes').authUserId;
    adminAuthLogin('goo4email@gmail.com', 'Passsword123');
    adminAuthLogin('goo4email@gmail.com', 'Passsword123');
    adminAuthLogin('goo4email@gmail.com', 'Passsword123');
    adminAuthLogin('goo4email@gmail.com', 'Passsword123');
    const userDetails = adminUserDetails(authUserId);
    expect(userDetails).toMatchObject({
      user: {
        userId: 0,
        name: 'Joh nny-Bone Jo\'nes',
        email: 'goo4email@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 4,
      }
    });
  });
});