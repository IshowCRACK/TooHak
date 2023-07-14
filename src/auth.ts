import { AdminUserDetailsReturn, AdminUpdateUserDetailsReturn, adminUpdateUserPasswordReturn, Data, Token, Jwt, ErrorAndStatusCode, OkObj } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import { checkName, checkPassword, emailAlreadyUsed, checkTokenValidStructure, checkTokenValidSession } from './helper';
import validator from 'validator';
import { addTokenToSession, checkJwtValid, createToken, getTokenLogin, tokenToJwt, jwtToToken } from './token';

/**
  * Register a user with an email, password, and names, then returns thier authUserId value
  *
  * @param {string} email - Users email
  * @param {string} password - Users password with at least 1 number and 1 letter and is 8 characters long
  * @param {string} nameFirst - Users first name
  * @param {string} nameLast - Users last name
  * @returns {{authUserId: number} | {error: string}} - Returns an integer, authUserId that is unique to the user
*/
function adminAuthRegister (email: string, password: string, nameFirst: string, nameLast: string): Jwt | ErrorAndStatusCode {
  const data = getData();

  // checking if any parts are null
  if (email === null || password === null || nameFirst === null || nameLast === null) {
    return {
      error: 'All sections should be filled',
      statusCode: 400
    };
  }

  // checking email hasnt been used
  for (const user of data.users) {
    if (user.email === email) {
      return {
        error: 'Email already used',
        statusCode: 400
      };
    }
  }

  // check email is valid using validator
  if (!validator.isEmail(email)) {
    return {
      error: 'Email is not valid',
      statusCode: 400
    };
  }

  // checking first name
  if (nameFirst.length > 20 || nameFirst.length < 2) {
    return {
      error: 'First name has to be between 2 and 20 characters',
      statusCode: 400
    };
  }

  if (!checkName(nameFirst)) {
    return {
      error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      statusCode: 400
    };
  }

  // checking last name
  if (nameLast.length > 20 || nameLast.length < 2) {
    return {
      error: 'Last name has to be between 2 and 20 characters',
      statusCode: 400
    };
  }

  if (!checkName(nameLast)) {
    return {
      error: 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes',
      statusCode: 400
    };
  }

  // checking password
  if (password.length < 8 || !checkPassword(password)) {
    return {
      error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter',
      statusCode: 400
    };
  }

  // else if every parameter is valid push into users database
  const userID = data.users.length;
  data.users.push({
    email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    authUserId: userID,
    numSuccessLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    deletedQuizzes: [],
    prevPassword: [password],
  });

  setData(data);

  const token: Token = createToken(userID);
  addTokenToSession(token);

  return tokenToJwt(token);
}

/**
  * Given a registered user's email and password returns their authUserId value
  *
  * @param {string} email - Users email
  * @param {string} password - Users password with at least 1 number and 1 letter and is 8 characters long
  *
  * @returns {{authUserId: number} | {error: string}} - returns an integer, authUserId that is unique to the user
*/
function adminAuthLogin (email: string, password: string): Jwt | ErrorAndStatusCode {
  const data = getData();

  // loop through users array from dataStore
  for (const user of data.users) {
    if (user.email === email && user.password === password) {
      // add successful logins for all times & change failed password
      user.numSuccessLogins++;
      user.numFailedPasswordsSinceLastLogin = 0;

      const token: Token = getTokenLogin(user.authUserId);
      addTokenToSession(token);

      return tokenToJwt(token);
    } else {
      // Add on to how many times user has failed before a successful login
      user.numFailedPasswordsSinceLastLogin++;
    }
  }

  return { error: 'Username or Password is not valid', statusCode: 400 };
}

/**
  * Given an admin user's authUserId, return details about the user
  *
  * @param {number} authUserId - Unique Id for a user to help identify them
  *
  * @returns {{user: {userId: number, name: string, email: string, numSuccessfulLogins: number, numFailedPasswordsSinceLastLogin: number}} | {error: string}} - Returns an object of User details
*/
function adminUserDetails (jwt: Jwt): AdminUserDetailsReturn | ErrorAndStatusCode {
  const data: Data = getData();
  // checking valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }
  // check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }
  //
  const authUserId: number = jwtToToken(jwt).userId;
  // Loop through users dataStore
  for (const user of data.users) {
    // if ID matched return the users ID
    if (user.authUserId === authUserId) {
      return {
        user: {
          userId: user.authUserId,
          name: `${user.nameFirst} ${user.nameLast}`,
          email: user.email,
          numSuccessfulLogins: user.numSuccessLogins,
          numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin
        }
      };
    }
  }
}

/**
 * Update a User's details with an email, password, or names, then returns an empty object.
 *
 * @param {number} authUserId - User's unique ID
 * @param {string} email - User's email
 * @param {string} nameFirst - User's first name
 * @param {string} nameLast - User's last name
 *
 * @returns {{} | {error: string}} - Returns an empty object or Error
 */
/*
function adminUpdateUserDetails(jwt: Jwt, email: string, nameFirst: string, nameLast: string): AdminUpdateUserDetailsReturn | ErrorAndStatusCode {
  const data = getData();
  const authUserId: number = jwtToToken(jwt).userId;
  // Find the user by authUserId
  const user = data.users.find((user) => user.authUserId === authUserId);

  // checking valid token structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }
  // check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }
  if (user) {
    let changes = false;
    // Check if email is provided and valid
    if (email) {
      // Check if email is valid and not used by another user
      if (!validator.isEmail(email) || emailAlreadyUsed(email, authUserId) === true) {
        return {
          error: 'Invalid email or email is already in use',
          statusCode: 400,
        };
      }

      user.email = email;
      changes = true;
    }

    // Update the user's details if the inputs are valid
    if (checkName(nameFirst) === true) {
      user.nameFirst = nameFirst;
      changes = true;
    } else {
      return {
        error: 'Invalid first name',
        statusCode: 400,
      };
    }

    if (checkName(nameLast)) {
      user.nameLast = nameLast;
      changes = true;
    } else {
      return {
        error: 'Invalid last name',
        statusCode: 400,
      };
    }

    // Update data only if there were changes
    if (changes === true) {
      setData(data);
    }
  }
  return {};
}
*/
/**
  * Update a Users password with a new password, then returns empty object
  *
  * @param {number} authUserId - Users Id
  * @param {string} oldPassword - Users old password
  * @param {string} newPassword - Users new password
  *
 * @returns {{} | {error: string}} - Returns an empty object or Error
*/
/*
function adminUpdateUserPassword(jwt: Jwt, oldPassword: string, newPassword: string): adminUpdateUserPasswordReturn | ErrorAndStatusCode  {
  const data = getData();
  const authUserId: number = jwtToToken(jwt).userId;
  // Find the user by authUserId
  const user = data.users.find((user) => user.authUserId === authUserId);

  // checking valid token structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }
  // check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token is not for currently logged in session',
      statusCode: 403
    };
  }

  if (user) {
    // Check if the old password matches the user's current password
    if (user.password !== oldPassword) {
      return {
        error: 'Old password is not correct',
        statusCode: 400,
      };
    }

    // Check if the new password has been used before by this user
    if (user.password === newPassword) {
      return {
        error: 'New password cannot be the same as the old password',
        statusCode: 400,
      };
    }
    // Check password has not been used before by this user
    if (user.prevPassword.includes(newPassword) === true) {
      return {
        error: 'New password cannot be the same as the old password',
        statusCode: 400,
      };
    }

    // Check if the new password meets the requirements
    if (!checkPassword(newPassword)) {
      return {
        error: 'New password must be at least 8 characters long and contain at least one number and one letter',
        statusCode: 400,
      };
    }

    // Update the user's password
    user.password = newPassword;
    user.prevPassword.push(newPassword);
    setData(data);
  }

  return {};
}
*/
export const adminAuthLogout = (jwt: Jwt): OkObj | ErrorAndStatusCode => {
  const possibleToken = checkJwtValid(jwt);

  if (possibleToken.valid === false) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  const data = getData();
  const token = possibleToken.token as Token;

  const index = data.session.findIndex(arrToken => JSON.stringify(arrToken) === JSON.stringify(token));

  if (index !== -1) {
    data.session.splice(index, 1);
    return {};
  }

  return {
    error: 'User has already logged out',
    statusCode: 400
  };
};

export { adminAuthLogin, adminAuthRegister, adminUserDetails /* adminUpdateUserDetails, adminUpdateUserPassword */ };
