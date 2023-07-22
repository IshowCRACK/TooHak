import { AdminUserDetailsReturn, Data, Token, Jwt, ErrorAndStatusCode, OkObj, User } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import { checkName, checkPassword, emailAlreadyUsed, checkTokenValidStructure, checkTokenValidSession, createUserId } from './helper';
import validator from 'validator';
import { addTokenToSession, checkJwtValid, createToken, getTokenLogin, tokenToJwt, jwtToToken } from './token';
import HTTPError from 'http-errors';

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
    throw HTTPError(400, 'All sections should be filled');
  }

  // checking email hasnt been used
  for (const user of data.users) {
    if (user.email === email) {
      throw HTTPError(400, 'Email already used');
    }
  }

  // check email is valid using validator
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Email is not valid');
  }

  // checking first name
  if (nameFirst.length > 20 || nameFirst.length < 2) {
    throw HTTPError(400, 'First name has to be between 2 and 20 characters');
  }

  if (!checkName(nameFirst)) {
    throw HTTPError(400, 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes');
  }

  // checking last name
  if (nameLast.length > 20 || nameLast.length < 2) {
    throw HTTPError(400, 'Last name has to be between 2 and 20 characters');
  }

  if (!checkName(nameLast)) {
    throw HTTPError(400, 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes');
  }

  // checking password
  if (!checkPassword(password)) {
    throw HTTPError(400, 'Password length has to be 8 characters & needs to contain at least one number and at least one letter');
  }

  // else if every parameter is valid push into users database
  const userID = createUserId();
  data.metaData.totalUsers++;

  data.users.push({
    email: email,
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
      console.log('EEYEYYE');
      console.log(data);
      user.numSuccessLogins++;
      console.log(data);
      user.numFailedPasswordsSinceLastLogin = 0;
      setData(data);

      const token: Token = getTokenLogin(user.authUserId);

      addTokenToSession(token);
      return tokenToJwt(token);
    } else {
      // Add on to how many times user has failed before a successful login
      user.numFailedPasswordsSinceLastLogin++;
      setData(data);
    }
  }
  throw HTTPError(400, 'Username or Password is not valid');
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
    throw HTTPError(401, 'Token is not a valid structure');
  }
  // check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
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

function adminUpdateUserDetails(jwt: Jwt, email: string, nameFirst: string, nameLast: string): OkObj | ErrorAndStatusCode {
  const data = getData();
  const token: Token = jwtToToken(jwt);
  const authUserId: number = token.userId;

  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }

  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  // Check if email is valid and not used by another user
  if (!validator.isEmail(email) || emailAlreadyUsed(email, authUserId)) {
    throw HTTPError(400, 'Invalid email or email is already in use');
  }

  // Check if user's nameFirst is valid
  if (nameFirst.length <= 2 || nameFirst.length >= 20) {
    throw HTTPError(400, 'Invalid first name');
  }
  if (!checkName(nameFirst) || !checkName(nameLast)) {
    throw HTTPError(400, 'Name can only contain alphanumeric symbols');
  }

  if (nameLast.length <= 2 || nameLast.length >= 20) {
    throw HTTPError(400, 'Invalid last name');
  }

  // Update data only if there were changes

  const updateDetail = data.users.find(({ authUserId: id }) => id === authUserId) as User;
  updateDetail.nameFirst = nameFirst;
  updateDetail.nameLast = nameLast;
  updateDetail.email = email;

  setData(data);

  return {};
}

/**
  * Update a Users password with a new password, then returns empty object
  *
  * @param {number} authUserId - Users Id
  * @param {string} oldPassword - Users old password
  * @param {string} newPassword - Users new password
  *
 * @returns {{} | {error: string}} - Returns an empty object or Error
*/
function adminUpdateUserPassword(jwt: Jwt, oldPassword: string, newPassword: string): OkObj | ErrorAndStatusCode {
  const data = getData();

  // checking valid structure
  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }
  // check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token is not for currently logged in session');
  }

  const token: Token = jwtToToken(jwt);
  const authUserId: number = token.userId;

  // Find the user by authUserId
  const user = data.users.find((user) => user.authUserId === authUserId);

  if (user) {
    // Check if the old password matches the user's current password
    if (user.password !== oldPassword) {
      throw HTTPError(400, 'Old password is not correct');
    }

    // Check if the new password has been used before by this user
    if (user.password === newPassword || user.prevPassword.includes(newPassword) === true) {
      throw HTTPError(400, 'New password cannot be the same as the old password');
    }

    // Check if the new password meets the requirements
    if (!checkPassword(newPassword)) {
      throw HTTPError(400, 'New password must be at least 8 characters long and contain at least one number and one letter');
    }

    // Update the user's password
    user.password = newPassword;
    user.prevPassword.push(newPassword);

    setData(data);
  } else {
    throw HTTPError(400, 'wtf');
  }
  return {};
}

export const adminAuthLogout = (jwt: Jwt): OkObj | ErrorAndStatusCode => {
  const possibleToken = checkJwtValid(jwt);

  if (possibleToken.valid === false) {
    throw HTTPError(401, 'Token is not a valid structure');
  }

  const data = getData();
  const token = possibleToken.token as Token;

  const index = data.session.findIndex(arrToken => JSON.stringify(arrToken) === JSON.stringify(token));

  if (index !== -1) {
    data.session.splice(index, 1);
    setData(data);
    return {};
  }
  throw HTTPError(400, 'User has already logged out');
};

export { adminAuthLogin, adminAuthRegister, adminUserDetails, adminUpdateUserDetails, adminUpdateUserPassword };
