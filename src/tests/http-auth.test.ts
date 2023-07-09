import { AdminAuthLogin, AdminAuthLogout, AdminAuthRegister, ErrorObj } from '../../interfaces/interfaces';
import request from 'sync-request';
import { getUrl } from '../helper';

const URL: string = getUrl();

// Wrapper functions
function registerUser (email: string, password: string, nameFirst: string, nameLast:string): AdminAuthRegister | ErrorObj {
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
  const authRegisterId: AdminAuthRegister | ErrorObj = JSON.parse(res.body.toString());
  return authRegisterId;
}

function loginUser (email: string, password: string): AdminAuthLogin | ErrorObj {
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
  const authLoginId: AdminAuthLogin | ErrorObj = JSON.parse(res.body.toString());
  return authLoginId;
}

function clearUsers (): void {
  request(
    'DELETE',
    URL + 'v1/clear'
  );
}

// const logoutUserHandler = (httpToken: HttpToken) => {
//   const res = request(
//     'POST',
//     URL + 'v1/admin/auth/logout',
//     {
//       json: {
//         token: httpToken
//       }
//     }
//   );

//   const logOutResponse: AdminAuthLogout | ErrorObj = JSON.parse(res.body.toString());
//   return logOutResponse;
// }

// TESTS FOR REGISTER //

beforeEach(() => {
  clearUsers();
});

describe('adminAuthRegister tests', () => {
  test('Check successful Register', () => {
    const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('example@email.com', 'Password123', 'First', 'Last');
    expect(authRegisterId).toStrictEqual({ authUserId: 0 });
  });

  describe('Unsuccessful register - names', () => {
    test('Check unsuccessful first name - null input', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Password123', '', 'Jones');
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - using wrong characters', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny-B345one', 'Jones');
      const expectedResult = {
        error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - wrong size', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'J', 'Jones');
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful first name - wrong size', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Jooooooooooooooooooooooooooonnnnnnnnyyyyyyy', 'Jones');
      const expectedResult = {
        error: 'First name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - null input', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', '');
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - using wrong characters', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'Jo124143\'nes');
      const expectedResult = {
        error: 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - Wrong size', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'J');
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful last name - Wrong size', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'joooooooooooooooooooooooonnnnnnnnnneeeeeeeeeeessssss');
      const expectedResult = {
        error: 'Last name has to be between 2 and 20 characters',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });
  });

  describe('Unsuccessful Register - password', () => {
    test('Check unsuccessful password - less then 8 characters', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Pas', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', '123456789', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', '', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'pyassword', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });
  });

  describe('Unsuccessful Register - email', () => {
    test('Check unsuccessful email - email not valid', () => {
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.emailgmail.com', 'Password123', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Email is not valid',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });

    test('Check unsuccessful email - email used already', () => {
      registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'Jones');
      const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('good.email@gmail.com', 'Password123', 'Johnny', 'Jones');
      const expectedResult = {
        error: 'Email already used',
      };
      expect(authRegisterId).toStrictEqual(expectedResult);
    });
  });
});

// // TESTS FOR LOGIN //
// describe('adminAuthLogin tests', () => {
//   describe('Successful Login', () => {
//     test('One user login', () => {
//       const authUserId: AdminAuthRegister | ErrorObj = registerUser('goofy.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jones');
//       const authUserIdLogin: AdminAuthLogin | ErrorObj = loginUser('goofy.email@gmail.com', 'Password123');
//       expect(authUserId).toStrictEqual(authUserIdLogin);
//     });
//     test('Multiple user login', () => {
//       registerUser('good.ail@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
//       const authUserId: AdminAuthRegister | ErrorObj = registerUser('gooemail@gmail.com', 'Password121233', 'Joh nny-Bone', 'Jones');
//       const authUserId2: AdminAuthRegister | ErrorObj = registerUser('gdemail@gmail.com', 'Password112315g23', 'Joh nny-Bone', 'Jones');
//       const authUserIdLogin: AdminAuthRegister | ErrorObj = loginUser('gooemail@gmail.com', 'Password121233');
//       const authUserIdLogin2: AdminAuthRegister | ErrorObj = loginUser('gdemail@gmail.com', 'Password112315g23');
//       expect(authUserId).toStrictEqual(authUserIdLogin);
//       expect(authUserId2).toStrictEqual(authUserIdLogin2);
//     });
//   });

//   describe('Unsuccessful Login', () => {
//     test('User does not exist', () => {
//       registerUser('gooil@gmail.com', 'Password12sdf3', 'Joh nny-Bone', 'Jones');
//       registerUser('mail@gmail.com', 'Password12sdf3', 'Joh nny-Bone', 'Jones');
//       const authUserIdLogin: AdminAuthRegister | ErrorObj = loginUser('goyeama@gmail.com', 'Pasworadsa2d123');
//       expect(authUserIdLogin).toStrictEqual({ error: 'Username or Password is not valid' });
//     });
//     test('Wrong Email', () => {
//       registerUser('good.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jones');
//       const authUserIdLogin: AdminAuthRegister | ErrorObj = loginUser('good.ema@gmail.com', 'Password123');
//       expect(authUserIdLogin).toStrictEqual({ error: 'Username or Password is not valid' });
//     });
//     test('Wrong Password', () => {
//       registerUser('good.ail@gmail.com', 'Password123', 'Joh nny-Bone', 'Jones');
//       const authUserIdLogin: AdminAuthLogin | ErrorObj = loginUser('good.ail@gmail.com', 'Passw15g23');
//       expect(authUserIdLogin).toStrictEqual({ error: 'Username or Password is not valid' });
//     });
//   });
// });

// describe('clear tests', () => {
//   test('Clearing users', () => {
//     registerUser('email@gmail.com', 'Password123', 'Johnny', 'Jones');
//     registerUser('emailllll@gmail.com', 'Password123', 'Johnny', 'Jones');
//     clearUsers();
//     const authRegisterId: AdminAuthRegister | ErrorObj = registerUser('email@gmail.com', 'Password123', 'Johnny', 'Jones');
//     expect(authRegisterId).toStrictEqual({ authUserId: 0 });
//   });
// });

// // TESTS FOR LOGOUT //
// describe.skip('Tests related to logging out an admin', () => {
//   beforeEach(() => {
//     // const token: Token = convertToken(registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith'));
//   })
// });
