import { AdminAuthLoginReturn, AdminAuthRegisterReturn, AdminUserDetailsReturn, AdminUpdateUserDetailsReturn } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import { checkName, checkPassword, emailAlreadyUsed } from './helper';
import validator from 'validator';

/**
  * Register a user with an email, password, and names, then returns thier authUserId value
  *
  * @param {string} email - Users email
  * @param {string} password - Users password with at least 1 number and 1 letter and is 8 characters long
  * @param {string} nameFirst - Users first name
  * @param {string} nameLast - Users last name
  * @returns {{authUserId: number} | {error: string}} - Returns an integer, authUserId that is unique to the user
*/
function adminAuthRegister (email: string, password: string, nameFirst: string, nameLast: string): AdminAuthRegisterReturn {
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
      error: 'First name has to be between 2 and 20 characters'
    };
  }

  if (!checkName(nameFirst)) {
    return {
      error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes'
    };
  }

  // checking last name
  if (nameLast.length > 20 || nameLast.length < 2) {
    return {
      error: 'Last name has to be between 2 and 20 characters'
    };
  }

  if (!checkName(nameLast)) {
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
    nameFirst: nameFirst,
    nameLast: nameLast,
    authUserId: userID,
    numSuccessLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
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
function adminUserDetails (authUserId: number): AdminUserDetailsReturn {
  const data = getData();

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
function adminAuthLogin (email: string, password: string): AdminAuthLoginReturn {
  const data = getData();

  // loop through users array from dataStore
  for (const user of data.users) {
    if (user.email === email && user.password === password) {
      // add successful logins for all times & change failed password
      user.numSuccessLogins++;
      user.numFailedPasswordsSinceLastLogin = 0;
      return { authUserId: user.authUserId };
    } else {
      // Add on to how many times user has failed before a successful login
      user.numFailedPasswordsSinceLastLogin++;
    }
  }

  return { error: 'Username or Password is not valid' };
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
function adminUpdateUserDetails(authUserId: number, email: string, nameFirst: string, nameLast: string): AdminUpdateUserDetailsReturn {
  const data = getData();

  // Find the user by authUserId
  const user = data.users.find((user) => user.authUserId === authUserId);

  if (user) {
    let emailChanged = false;

    // Check if email is provided and valid
    if (email) {
      // Check if email is valid and not used by another user
      if (!validator.isEmail(email) || emailAlreadyUsed(email, authUserId)) {
        return {
          error: 'Invalid email or email is already in use'
        };
      }

      user.email = email;
      emailChanged = true;
    }

    // Update the user's details if the inputs are valid
    if (checkName(nameFirst) && nameFirst.length >= 2 && nameFirst.length <= 20) {
      user.nameFirst = nameFirst;
    } else {
      return {
        error: 'Invalid first name'
      };
    }

    if (checkName(nameLast) && nameLast.length >= 2 && nameLast.length <= 20) {
      user.nameLast = nameLast;
    } else {
      return {
        error: 'Invalid last name'
      };
    }

    // Update data only if there were changes
    if (emailChanged) {
      setData(data);
    }
  } else {
    return {
      error: 'User not found'
    };
  }

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
function adminUpdateUserPassword(authUserId: number, oldPassword: string, newPassword: string): {} {
  const data = getData();

  // Find the user by authUserId
  const user = data.users.find((user) => user.authUserId === authUserId);

  if (user) {
    // Check if the old password matches the user's current password
    if (user.password !== oldPassword) {
      return {
        error: 'Old password is not correct'
      };
    }

    // Check if the new password has been used before by this user
    if (user.password === newPassword) {
      return {
        error: 'New password cannot be the same as the old password'
      };
    }

    // Check if the new password meets the requirements
    if (newPassword.length < 8 || !checkPassword(newPassword)) {
      return {
        error: 'New password must be at least 8 characters long and contain at least one number and one letter'
      };
    }

    // Update the user's password
    user.password = newPassword;

    setData(data);
  } else {
    return {
      error: 'User not found'
    };
  }

  return {};
}


export { adminAuthLogin, adminAuthRegister, adminUserDetails, adminUpdateUserDetails, adminUpdateUserPassword };