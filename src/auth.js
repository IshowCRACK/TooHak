import { getData, setData } from './dataStore.js';
import validator from 'validator';

/**
  * Register a user with an email, password, and names, then returns thier authUserId value
  *
  * @param {string} email - Users email
  * @param {string} password - Users password with at least 1 number and 1 letter and is 8 characters long
  * @param {string} nameFirst - Users first name
  * @param {string} nameLast - Users last name
  *
  * @returns {{authUserId: number} | {error: string}} - Returns an integer, authUserId that is unique to the user
*/
function adminAuthRegister (email, password, nameFirst, nameLast) {
  const data = getData();

  // checking if any parts are null
  if (email === null || password === null || nameFirst === null || nameLast === null) {
    return {
      error: 'All sections should be filled'
    };
  }
  // checking email hasnt been used
  for (const user of data.users) {
    if (user.email === email) {
      return {
        error: 'Email already used'
      };
    }
  }
  // check email is valid using validator
  if (!validator.isEmail(email)) {
    return {
      error: 'Email is not valid'
    };
  }
  // checking first name
  if (nameFirst.length > 20 || nameFirst.length < 2) {
    return {
      error: 'first name has to be between 2 and 20 characters'
    };
  } else if (!checkName(nameFirst)) {
    return {
      error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes'
    };
  }
  // checking last name
  if (nameLast.length > 20 || nameLast.length < 2) {
    return {
      error: 'Last name has to be between 2 and 20 characters'
    };
  } else if (!checkName(nameLast)) {
    return {
      error: 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes'
    };
  }
  // checking password
  if (password.length < 8 || !checkPassword(password)) {
    return {
      error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'
    };
  }
  // else if every parameter is valid push into users database
  const userID = data.users.length;
  data.users.push({
    email,
    password,
    firstName: nameFirst,
    lastName: nameLast,
    authUserId: userID,
    numSuccessLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    failNow: 0
  });

  setData(data);

  return {
    authUserId: userID
  };
}

/**
  * Given an admin user's authUserId, return details about the user
  *
  * @param {number} authUserId - Unique Id for a user to help identify them
  *
  * @returns {{user: {userId: number, name: string, email: string, numSuccessfulLogins: number, numFailedPasswordsSinceLastLogin: number}} | {error: string}} - Returns an object of User details
*/
function adminUserDetails (authUserId) {
  const data = getData();

  // Loop through users dataStore
  for (const user of data.users) {
    // if ID matched return the users ID
    if (user.authUserId === authUserId) {
      return {
        user: {
          userId: user.authUserId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          numSuccessfulLogins: user.numSuccessLogins,
          numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin
        }
      };
    }
  }
  return {
    error: 'User does not exists'
  };
}

/**
  * Given a registered user's email and password returns their authUserId value
  *
  * @param {string} email - Users email
  * @param {string} password - Users password with at least 1 number and 1 letter and is 8 characters long
  *
  * @returns {{authUserId: number} | {error: string}} - returns an integer, authUserId that is unique to the user
*/
function adminAuthLogin (email, password) {
  const data = getData();

  // loop through users array from dataStore
  for (const user of data.users) {
    if (user.email === email) {
      if (user.password === password) {
        // add successful logins for all times
        const total = user.numSuccessLogins + 1;
        user.numSuccessLogins = total;

        // If user messed up in log in prior to successful login
        if (user.failNow > 0) {
          user.numFailedPasswordsSinceLastLogin = user.failNow;
          user.failNow = 0;

          // User didnt fail to login this instance
        } else if (user.failNow === 0) {
          user.numFailedPasswordsSinceLastLogin = 0;
        }
        setData(data);
        return {
          authUserId: user.authUserId
        };
      } else {
        // Add on to how many times user has failed before a successful login
        user.failNow = user.failNow + 1;
        setData(data);
      }
    }
  }
  return {
    error: 'Username or Password is not valid'
  };
}

/**
 * -------------------------------------- HELPERS FUNCTIONS-----------------------------------------------
 */

/**
  * Function looks at the characters used in first name/last name
  *
  * @param {string} name - String that contains letters, spaces, hyphens or apostrophes
  *
  * @returns {boolean} - Returns true or false if first name or last name satisfies the conditions
*/
function checkName (name) {
  return /^[a-zA-Z\s\-']+$/.test(name);
}

/**
  * Function checks if password contains at least one number and letter
  *
  * @param {string} password - String that contains atleast 1 number and 1 letter and is 8 characters long
  *
  * @returns {boolean} - Returns true or false if password satisfies the conditions
*/
function checkPassword (password) {
  return /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);
}

export { adminAuthLogin, adminAuthRegister, adminUserDetails };
