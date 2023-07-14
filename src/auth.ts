import { AdminUserDetailsReturn, Data, Token, Jwt, ErrorAndStatusCode, OkObj, User } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import { checkName, checkPassword, emailAlreadyUsed, checkTokenValidStructure, checkTokenValidSession, createUserId } from './helper';
import validator from 'validator';
import { addTokenToSession, checkJwtValid, createToken, getTokenLogin, tokenToJwt, jwtToToken } from './token';

/**
  * Register a user with an email, password, and names, then returns a token
  *
**/
export function adminAuthRegister (email: string, password: string, nameFirst: string, nameLast: string): Jwt | ErrorAndStatusCode {
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
  * Given a registered user's email and password returns their jwt value
  *
**/
export function adminAuthLogin (email: string, password: string): Jwt | ErrorAndStatusCode {
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

  return { error: 'Username or Password is not valid', statusCode: 400 };
}

/**
  * Given an admin user's token object, return details about the user
  *
*/
export function adminUserDetails (jwt: Jwt): AdminUserDetailsReturn | ErrorAndStatusCode {
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
 * Update a User's details with an token object, email, password, or names, then returns an empty object.
 * 
 **/

export function adminUpdateUserDetails(jwt: Jwt, email: string, nameFirst: string, nameLast: string): OkObj | ErrorAndStatusCode {
  const data = getData();
  const token: Token = jwtToToken(jwt);
  const authUserId: number = token.userId;

  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }

  // Check if email is valid and not used by another user
  if (!validator.isEmail(email) || emailAlreadyUsed(email, authUserId)) {
    return {
      error: 'Invalid email or email is already in use',
      statusCode: 400
    };
  }

  // Check if user's nameFirst is valid
  if (nameFirst.length <= 2 || nameFirst.length >= 20) {
    return {
      error: 'Invalid first name',
      statusCode: 400
    };
  }
  if (!checkName(nameFirst) || !checkName(nameLast)) {
    return {
      error: 'Name can only contain alphanumeric symbols',
      statusCode: 400
    };
  }

  if (nameLast.length <= 2 || nameLast.length >= 20) {
    return {
      error: 'Invalid last name',
      statusCode: 400
    };
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
*/

function adminUpdateUserPassword(jwt: Jwt, oldPassword: string, newPassword: string): OkObj | ErrorAndStatusCode {
  const data = getData();

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
      error: 'Token is not for currently logged in session',
      statusCode: 403
    };
  }

  const token: Token = jwtToToken(jwt);
  const authUserId: number = token.userId;

  // Find the user by authUserId
  const user = data.users.find((user) => user.authUserId === authUserId);

  if (user) {
    // Check if the old password matches the user's current password
    if (user.password !== oldPassword) {
      return {
        error: 'Old password is not correct',
        statusCode: 400
      };
    }

    // Check if the new password has been used before by this user
    if (user.password === newPassword) {
      return {
        error: 'New password cannot be the same as the old password',
        statusCode: 400
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
    if (newPassword.length < 8 || !checkPassword(newPassword)) {
      return {
        error: 'New password must be at least 8 characters long and contain at least one number and one letter',
        statusCode: 400
      };
    }

    // Update the user's password
    user.password = newPassword;
    user.prevPassword.push(newPassword);

    setData(data);
  } else {
    return {
      error: 'wtf',
      statusCode: 400
    };
  }
  return {};
}

/**
  * Takes in a token object and returns an empty object, signalling user has logged out 
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
    setData(data);
    return {};
  }

  return {
    error: 'User has already logged out',
    statusCode: 400
  };
};
