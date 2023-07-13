import { AdminQuizList, AdminUserALLDetailsReturn, ErrorObj, Token, Jwt, Quiz, Answer, Question } from '../interfaces/interfaces';
import { getData } from './dataStore';
import { adminQuizList } from './quiz';
import { checkJwtValid, jwtToToken } from './token';
import config from './config.json';

/**
 * -------------------------------------- HELPERS FUNCTIONS-----------------------------------------------
 */

export const getUrl = (): string => {
  const PORT: number = parseInt(process.env.PORT || config.port);
  const HOST: string = process.env.IP || 'localhost';
  const URL: string = 'http://' + HOST + ':' + PORT.toString() + '/';
  return URL;
};

export const formatError = (errorObj: ErrorObj) => { return { error: errorObj.error }; };

/**
  * Function looks at the characters used in first name/last name
  *
  * @param {string} name - String that contains letters, spaces, hyphens or apostrophes
  *
  * @returns {boolean} - Returns true or false if first name or last name satisfies the conditions
*/
export function checkName (name: string): boolean {
  return /^[a-zA-Z\s\-']+$/.test(name);
}

/**
  * Function checks if password contains at least one number and letter
  *
  * @param {string} password - String that contains atleast 1 number and 1 letter and is 8 characters long
  *
  * @returns {boolean} - Returns true or false if password satisfies the conditions
*/
export function checkPassword (password: string): boolean {
  return /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);
}

/**
  * Check if the name is only made up of alphanumbers and spaces
  *
  * @param {string} name - The name u are checking
  *
  * @returns {boolean} - Returns false if not made up of alphanumbers and spaces, else true
 */

export function checkAlphanumeric(name: string): boolean {
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
export function checkAuthUserIdValid (authUserId: number): boolean {
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
export function checkQuizIdValid (quizId: number): boolean {
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
export function checkQuizAndUserIdValid (quizId: number, authUserId: number): boolean {
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
export function checkQuizNameUsed (jwt: Jwt, quizName: string): boolean {
  const list = adminQuizList(jwt) as AdminQuizList;

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
export function emailAlreadyUsed(email: string, authUserId: number): boolean {
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
  *   authUserId: integer,
  *   nameFirst: string,
  *   nameLast: string,
  *   email: string,
  *   password: string,
  *   numSuccessLogins: integer,
  *   numFailedPasswordsSinceLastLogin: integer,
  * }>} - Array of objects
  */
export function adminUserALLDetails(authUserId: number): AdminUserALLDetailsReturn {
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
          deletedQuizzes: user.deletedQuizzes
        }
      };
    }
  }
  return {
    error: 'User does not exist',
  };
}

/**
  * Gets ALL the user details, as 'adminUserDetails' does not return all properties of 'User'
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  *
  * @returns {{quizzes: Array<{
  *   quizId: number;
  *   adminQuizId: number;
  *   name: string;
  *   timeCreated: number;
  *   timeLastEdited: number;
  *   description: string;
  * }>} | {error: string}} - An array of quizzes and its details
  *
  */
// function adminQuizALLDetails(quizId: number): AdminQuizALLDetailsReturn {
//   const data = getData();

//   for (const quiz of data.quizzes) {
//     if (quiz.quizId === quizId) {
//       return {
//         quizzes: {
//           quizId: quiz.quizId,
//           adminQuizId: quiz.adminQuizId,
//           name: quiz.name,
//           timeCreated: quiz.timeCreated,
//           timeLastEdited: quiz.timeLastEdited,
//           description: quiz.description
//         }
//       };
//     }
//   }
//   return {
//     error: 'Quiz does not exist',
//   };
// }

/**
 * Checks if the user owns a quiz globally
 *
 * @param {number} authUserId -User's unique ID
 * @param {number} quizId - quiz unique ID
 *
 * @returns {boolean} - Returns true if User owns quiz, otherwise false
 */
export function checkALLQuizOwnership(authUserId: number, quizId: number): boolean {
  const data = getData();

  // Check if the quizId exists in quizzes
  const quizExistsInQuizzes = data.quizzes.some((quiz) => quiz.quizId === quizId);

  // Check if the quizId exists in the user's deletedQuizzes
  const user = data.users.find((user) => user.authUserId === authUserId);
  const quizExistsInDeletedQuizzes = user.deletedQuizzes.some((quiz) => quiz.quizId === quizId);

  // Check if the user owns the quiz
  if (
    (quizExistsInQuizzes || quizExistsInDeletedQuizzes) &&
    (quizExistsInQuizzes && data.quizzes.find((quiz) => quiz.quizId === quizId).adminQuizId !== authUserId)
  ) {
    return false; // User does not own the quiz
  }

  return true; // User owns the quiz
}

/**
 * Checks if the quizId exists globally
 *
 * @param {number} quizId - quiz unique id
 *
 * @returns {boolean} - Returns true if User owns quiz, otherwise false
 */
export function checkQuizIdExistsGlobally(quizId: number): boolean {
  const data = getData();
  // Check if the quizId exists in the quizzes array
  const quizExistsInQuizzes = data.quizzes.some((quiz) => quiz.quizId === quizId);

  // Check if the quizId exists in the deletedQuizzes array of any user
  const quizExistsInDeletedQuizzes = data.users.some((user) =>
    user.deletedQuizzes.some((quiz) => quiz.quizId === quizId)
  );

  // Return true if the quizId exists in either array, false otherwise
  return quizExistsInQuizzes || quizExistsInDeletedQuizzes;
}

/**
 * Checks for error: 401 Token is not a valid structure
 * @param {Jwt} jwt - token unique id
 *
 * @returns {boolean} - Returns true if Token valid, otherwise false
 */
export function checkTokenValidStructure(jwt: Jwt): boolean {
  // check valid structure
  const possibleToken = checkJwtValid(jwt);

  if (possibleToken.valid === false) {
    return false;
  }
  return true;
}

/**
 * Checks for these error: 403 Provided token is valid structure, but is not for a currently logged in session
 * @param {Jwt} jwt - token unique id
 *
 * @returns {boolean} - Returns true if Token valid, otherwise false
 */
export function checkTokenValidSession(jwt: Jwt): boolean {
  const data = getData();
  //  check if valid for active sessions
  if ((data.session.find((token: Token) => token.userId === jwtToToken(jwt).userId)) === undefined) {
    return false;
  }
  return true;
}

export function getQuiz(quizId: number): Quiz {
  const data = getData();
  const res = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId
  );

  return res;
}

export function getTotalDuration(quiz: Quiz): number {
  let totalDuration = 0;
  for (const question of quiz.questions) {
    totalDuration += question.duration;
  }

  return totalDuration;
}

export function checkAnswerLengthValid(answers: Answer[]): boolean {
  return !(answers.some((answer: Answer) => answer.answer.length < 1 || answer.answer.length > 30));
}

export function checkQuestionAnswerNonDuplicate(answers: Answer[]): boolean {
  const encounteredAnswers = new Set();

  for (const answerObj of answers) {
    const answer = answerObj.answer;

    if (encounteredAnswers.has(answer)) return false;

    encounteredAnswers.add(answer);
  }

  return true;
}

export function checkAnswerHasTrueValue(answers: Answer[]): boolean {
  return (answers.some((answer: Answer) => answer.correct === true));
}

// export function createQuestionId(quiz: Quiz): number {
//   let questionId = -1;
//   // TODO: change this
//   for (const question of quiz.questions) {
//     if (question.questionId > questionId) questionId = question.questionId;
//   }

//   ++questionId;

//   return questionId;
// }

export function createQuestionId(quiz: Quiz): number {
  let maxQuestionId = -1;

  for (const question of quiz.questions) {
    if (question.questionId > maxQuestionId) {
      maxQuestionId = question.questionId;
    }
  }

  const newQuestionId = maxQuestionId + 1;

  return newQuestionId;
}

export function checkQuestionIdValid(questionId: number, quiz: Quiz): boolean {
  for (const question of quiz.questions) {
    if (question.questionId === questionId) {
      return true;
    }
  }
  return false;
}

export function checkNameUsedInQuiz(quizId: number, userId: number): boolean {
  const data = getData();

  const curQuiz: Quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);

  for (const quiz of data.quizzes) {
    if (quiz.quizId !== quizId && quiz.adminQuizId === userId && quiz.name === curQuiz.name) return true;
  }

  return false;
}

export function checkQuestionIdIsValidInQuiz(questions: Question[], questionId: number): boolean {
  const foundQuestion = questions.find((question) => question.questionId === questionId);
  return !!foundQuestion; // Convert the foundQuestion to a boolean value
}
