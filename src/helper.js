import { getData } from './dataStore.js';
import { adminQuizList } from './quiz.js';

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

/**
  * Check if the name is only made up of alphanumbers and spaces
  *
  * @param {string} name - The name u are checking
  *
  * @returns {boolean} - Returns false if not made up of alphanumbers and spaces, else true
 */

function checkAlphanumeric(name) {
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    return false;
  }

  return true;
}

/**
  * Check if the userId is valid and exists
  *
  * @param {number} authUserId - the id you are checking is valid or not
  *
  * @returns {boolean} - returns true if userId is valid, false otherwise
 */
function checkAuthUserIdValid (authUserId) {
  const data = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) return true;
  }

  return false;
}

/**
  * Check if the quizId is valid and exists
  *
  * @param {number} quizId - The id you are checking is valid or not
  *
  * @returns {boolean} - Returns true if userId is valid, false otherwise
 */
function checkQuizIdValid (quizId) {
  const data = getData();

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      return true;
    }
  }

  return false;
}

/**
  * Check if the user owns the specified quiz
  *
  * @param {number} quizId - The specified quiz
  * @param {number} authUserId - The user who you seeing whether or not created the quiz
  *
  * @returns {boolean} - Returns true if user owns quiz, false otherwise
 */
function checkQuizAndUserIdValid (quizId, authUserId) {
  const data = getData();

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId && quiz.adminQuizId === authUserId) {
      return true;
    }
  }

  return false;
}

/**
  * Check if quiz name is already used in another quiz by the same user
  *
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  * @param {number} quizName - The specified quiz name
  *
  * @returns {boolean} - Returns true if quizname is already used, otherwise, false
 */
function checkQuizNameUsed (authUserId, quizName) {
  const list = adminQuizList(authUserId);

  for (const quiz of list.quizzes) {
    if (quizName === quiz.name) {
      return true;
    }
  }

  return false;
}


/**
  * Check if email is already used in another User
  *
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  * @param {string} email - Users email
  *
  * @returns {boolean} - Returns true if email is already used, otherwise, false
 */
function emailAlreadyUsed(email, authUserId) {
  const data = getData();

  for (const user of data.users) {
    if (user.email === email && user.authUserId !== authUserId) {
      return true;
    }
  }

  return false;
}


/**
 * Gets ALL the user details, as 'adminUserDetails' does not return all properties of 'User'
 *
 * @param {number} authUserId - A unique Id for the user who owns the quiz
 *
 * @returns {Object | {error: string}} - User details object or an error object
 */
function adminUserALLDetails(authUserId) {
  const data = getData();

  // Find the user with the specified authUserId
  const user = data.users.find((user) => user.authUserId === authUserId);

  if (user) {
    return {
      user: {
        userId: user.authUserId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        password: user.password,
        numSuccessfulLogins: user.numSuccessLogins,
        numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
        deletedQuizzes: user.deletedQuizzes
      }
    };
  } else {
    return {
      error: 'User does not exist',
    };
  }
}


export {
  checkName, checkPassword, checkAlphanumeric, checkAuthUserIdValid,
  checkQuizIdValid, checkQuizAndUserIdValid, checkQuizNameUsed, emailAlreadyUsed, adminUserALLDetails,
};
