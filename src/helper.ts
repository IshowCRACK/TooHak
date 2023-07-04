import { AdminQuizList, AdminUserALLDetailsReturn } from '../interfaces/interfaces';
import { getData } from './dataStore';
import { adminQuizList } from './quiz';

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
function checkName (name: string): boolean {
  return /^[a-zA-Z\s\-']+$/.test(name);
}

/**
  * Function checks if password contains at least one number and letter
  *
  * @param {string} password - String that contains atleast 1 number and 1 letter and is 8 characters long
  *
  * @returns {boolean} - Returns true or false if password satisfies the conditions
*/
function checkPassword (password: string): boolean {
  return /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);
}

/**
  * Check if the name is only made up of alphanumbers and spaces
  *
  * @param {string} name - The name u are checking
  *
  * @returns {boolean} - Returns false if not made up of alphanumbers and spaces, else true
 */

function checkAlphanumeric(name: string): boolean {
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
function checkAuthUserIdValid (authUserId: number): boolean {
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
function checkQuizIdValid (quizId: number): boolean {
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
function checkQuizAndUserIdValid (quizId: number, authUserId: number): boolean {
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
  * @param {string} quizName - The specified quiz name
  *
  * @returns {boolean} - Returns true if quizname is already used, otherwise, false
 */
function checkQuizNameUsed (authUserId: number, quizName: string): boolean {
  const list = adminQuizList(authUserId) as AdminQuizList;

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
 * @param {string} email - User's email
 * @param {number} authUserId - User's unique ID
 *
 * @returns {boolean} - Returns true if email is already used, otherwise false
 */
function emailAlreadyUsed(email: string, authUserId: number): boolean {
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
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  *
  * @returns {users: Array<{
*     authUserId: integer,
*     nameFirst: string,
*     nameLast: string,
*     email: string,
*     password: string,
*     numSuccessLogins: integer,
*     numFailedPasswordsSinceLastLogin: integer,
*   }>} - Array of objects
*/
function adminUserALLDetails(authUserId: number): AdminUserALLDetailsReturn {
  const data = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return {
        user: {
            authUserId: user.authUserId,
            nameFirst: user.nameFirst,
            nameLast: user.nameLast,
            email: user.email,
            password: user.password,
            numSuccessLogins: user.numSuccessLogins,
            numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
        }
      };
    }
  }
  

  return {
    error: 'User does not exist',
  };
}



export {
  checkName, checkPassword, checkAlphanumeric, checkAuthUserIdValid,
  checkQuizIdValid, checkQuizAndUserIdValid, checkQuizNameUsed, emailAlreadyUsed, adminUserALLDetails
};
