import { adminAuthLogin, adminAuthRegister, adminUserDetails, adminUpdateUserDetails, adminUpdateUserPassword,  } from '../auth.js';
import { adminUserALLDetails, } from '../helper.js';
import { clear } from '../other.js';

beforeEach(() => {
  clear();
});

describe('adminAuthLogin tests', () => {
  test('Check successful register with 1 register', () => {
    adminAuthRegister('good.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
    adminAuthRegister('g1ood.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
    const authUserId3 = adminAuthRegister('god.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
    expect(authUserId3).toStrictEqual({ authUserId: 2 });
  });

  describe('Unsuccessful register - names', () => {
    test('Check unsuccessful first name - null input', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'Password123', '', 'Jones');
      expect(authUserId).toStrictEqual({ error: 'First name has to be between 2 and 20 characters' });
    });

    test('Check unsuccessful first name - using wrong characters', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'Password123', 'Johnny-B345one', 'Jones');
      expect(authUserId).toStrictEqual({ error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes' });
    });

    test('Check unsuccessful first name - Wrong Size', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'Password123', 'J', 'Jones');
      expect(authUserId).toStrictEqual({ error: 'First name has to be between 2 and 20 characters' });
    });

    test('Check unsuccessful first name - Wrong Size', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'Password123', 'Jooooooooooooooooooooooooooonnnnnnnnyyyyyyy', 'Jones');
      expect(authUserId).toStrictEqual({ error: 'First name has to be between 2 and 20 characters' });
    });

    test('Check unsuccessful last name - null input', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'Password123', 'Joh nny-Bone', '');
      expect(authUserId).toStrictEqual({ error: 'Last name has to be between 2 and 20 characters' });
    });

    test('Check unsuccessful last name - using wrong characters', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo124143\'nes');
      expect(authUserId).toStrictEqual({ error: 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes' });
    });

    test('Check unsuccessful last name - Wrong Size', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'Password123', 'Joh nny-Bone', 'j');
      expect(authUserId).toStrictEqual({ error: 'Last name has to be between 2 and 20 characters' });
    });

    test('Check unsuccessful LastName - Wrong Size', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'Password123', 'Joh nny-Bone', 'joooooooooooooooooooooooonnnnnnnnnneeeeeeeeeeessssss');
      expect(authUserId).toStrictEqual({ error: 'Last name has to be between 2 and 20 characters' });
    });
  });

  describe('Unsuccessful Register - password', () => {
    test('Check unsuccessful password - less then 8 characters', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'Pas', 'Joh nny-Bone', 'Jo\'nes');
      expect(authUserId).toStrictEqual({ error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter' });
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', '123456789', 'Joh nny-Bone', 'Jo\'nes');
      expect(authUserId).toStrictEqual({ error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter' });
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', '', 'Joh nny-Bone', 'Jo\'nes');
      expect(authUserId).toStrictEqual({ error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter' });
    });

    test('Check unsuccessful password - does not contain 1 number and 1 letter', () => {
      const authUserId = adminAuthRegister('good.email@gmail.com', 'pyassword', 'Joh nny-Bone', 'Jo\'nes');
      expect(authUserId).toStrictEqual({ error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter' });
    });
  });

  describe('Unsuccessful Register - email', () => {
    test('Check unsuccessful email - email not valid', () => {
      const authUserId = adminAuthRegister('good.emailgmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
      expect(authUserId).toStrictEqual({ error: 'Email is not valid' });
    });

    test('Check unsuccessful email - email used already', () => {
      adminAuthRegister('good.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
      const authUserId2 = adminAuthRegister('good.email@gmail.com', 'Password123', 'Joh nny-Bone', 'Jo\'nes');
      expect(authUserId2).toStrictEqual({ error: 'Email already used' });
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

//adminUserDetails test
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

//admin Update User details 
describe('AdminUpdateUserDetails tests', ()=> {
  beforeEach(() => {
    adminAuthRegister('something@gmail.com', 'password0', 'Ijlal', 'Khan');
    adminAuthRegister('joemama@gmail.com', 'password1', 'joe', 'mama');
  });

  describe('Unsuccessful User detail update', ()=> {
    test('Email is currently used by another user', () => {
      const result = adminUpdateUserDetails(0,'joemama@gmail.com', 'Ijlal', 'Khan');
      expect(result).toStrictEqual({ error: 'Invalid email or email is already in use' });
    });
    test('NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', () => {
      const result = adminUpdateUserDetails(0,'something@gmail.com', 'ij/Lal', 'Khan');
      expect(result).toStrictEqual({ error: 'Invalid first name' });
    });
    test('NameFirst is less than 2 characters', () => {
      const result = adminUpdateUserDetails(0,'something@gmail.com', 'a', 'Khan');
      expect(result).toStrictEqual({ error: 'Invalid first name' });
    });
    test('NameFirst is more than 20 characters', () => {
      const result = adminUpdateUserDetails(0,'something@gmail.com', 'AbcdeAbcdeAbcdeAbcdef', 'Khan');
      expect(result).toStrictEqual({ error: 'Invalid first name' });
    });
    test('NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes', () => {
      const result = adminUpdateUserDetails(0,'something@gmail.com', 'ijLal', 'Kh/an');
      expect(result).toStrictEqual({ error: 'Invalid last name' });
    });
    test('NameLast is less than 2 characters', () => {
      const result = adminUpdateUserDetails(0,'something@gmail.com', 'Ijlal', 'A');
      expect(result).toStrictEqual({ error: 'Invalid last name' });
    });
    test('NameLast is more than 20 characters', () => {
      const result = adminUpdateUserDetails(0,'something@gmail.com', 'Ijlal', 'AbcdeAbcdeAbcdeAbcdef');
      expect(result).toStrictEqual({ error: 'Invalid last name' });
    });
  });

  describe('Successful User detail update', ()=> {
    test('Updating Email', () => {
      adminUpdateUserDetails(0,'updated@gmail.com', 'Ijlal', 'Khan')
      const getAdminInfo = adminUserDetails(0)
      expect(getAdminInfo.user.email).toStrictEqual('updated@gmail.com');
    });
    test('Updating Email', () => {
      adminUpdateUserDetails(1,'updated2@gmail.com', 'joe', 'mama')
      const getAdminInfo = adminUserDetails(1)
      expect(getAdminInfo.user.email).toStrictEqual('updated2@gmail.com');
    });
    test('Updating first name', () => {
      adminUpdateUserDetails(0,'something@gmail.com', 'UpdatedNameFirst', 'Khan')
      const getAdminInfo = adminUserDetails(0)
      expect(getAdminInfo.user.name).toStrictEqual('UpdatedNameFirst Khan');
    });
    test('Updating first name', () => {
      adminUpdateUserDetails(1,'joemama@gmail.com', 'UpdatedNameFirst', 'mama')
      const getAdminInfo = adminUserDetails(1)
      expect(getAdminInfo.user.name).toStrictEqual('UpdatedNameFirst mama');
    });
    test('Updating last name', () => {
      adminUpdateUserDetails(0,'something@gmail.com', 'Ijlal', 'UpdatedNameLast')
      const getAdminInfo = adminUserDetails(0)
      expect(getAdminInfo.user.name).toStrictEqual('Ijlal UpdatedNameLast');
    });
    test('Updating last name', () => {
      adminUpdateUserDetails(1,'joemama@gmail.com', 'joe', 'UpdatedNameLast')
      const getAdminInfo = adminUserDetails(1)
      expect(getAdminInfo.user.name).toStrictEqual('joe UpdatedNameLast');
    });
  });
  
});

//admin Update User Password 
describe('AdminUpdateUserPassword tests', ()=> {
  beforeEach(() => {
    adminAuthRegister('something@gmail.com', 'password0', 'Ijlal', 'Khan');
    adminAuthRegister('joemama@gmail.com', 'password1', 'joe', 'mama');
  });

  describe('Unsuccessful User detail update', ()=> {
    test('Old Password is not the correct old password', () => {
      const result = adminUpdateUserPassword(0,'wrongPassword0','newPassword0');
      expect(result).toStrictEqual({ error: 'Old password is not correct' });
    });
    test('New Password has already been used before by this user', () => {
      const result = adminUpdateUserPassword(0,'password0','password0');
      expect(result).toStrictEqual({ error: 'New password cannot be the same as the old password' });
    });
    test('New Password is less than 8 characters', () => {
      const result = adminUpdateUserPassword(0,'password0','abc1234');
      expect(result).toStrictEqual({ error: 'New password must be at least 8 characters long and contain at least one number and one letter' });
    });
    test('New Password does not contain at least one number and at least one letter', () => {
      const result = adminUpdateUserPassword(0,'password0','12345678');
      expect(result).toStrictEqual({ error: 'New password must be at least 8 characters long and contain at least one number and one letter' });
    });
    test('New Password does not contain at least one number and at least one letter', () => {
      const result = adminUpdateUserPassword(0,'password0','abcdefghijk');
      expect(result).toStrictEqual({ error: 'New password must be at least 8 characters long and contain at least one number and one letter' });
    });
  });

  describe('Successful User password update', ()=> {
    test('Updating password', () => {
      adminUpdateUserPassword(0,'password0','newPassword0');
      const getAdminInfo = adminUserALLDetails(0)
      expect(getAdminInfo.user.password).toStrictEqual('newPassword0');
    });
    test('Updating password, multiple users', () => {
      adminUpdateUserPassword(0,'password0','newPassword0');
      adminUpdateUserPassword(1,'password1','newPassword1');
      const getAdminInfo0 = adminUserALLDetails(0)
      const getAdminInfo1 = adminUserALLDetails(1)

      expect(getAdminInfo0.user.password).toStrictEqual('newPassword0');
      expect(getAdminInfo1.user.password).toStrictEqual('newPassword1');

    });
  });
});
