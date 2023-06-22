import { getData, setData } from './dataStore.js';
import { checkAuthUserIdValid } from './helper.js';

/**
  * Update the description of the relevant quiz
  *
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  * @param {number} quizId - A unique Id for the specified quiz
  * @param {string} description - Quiz description
  *
  * @returns {{} | {error: string}} - Returns an empty object if valid
 */
function adminQuizDescriptionUpdate (authUserId, quizId, description) {
  const data = getData();

  let user;
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].authUserId === authUserId) {
      user = data.users[i];
      break;
    }
  }
  if (!user) {
    return { error: 'authUserId is not a valid user' };
  }

  let quiz;
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].quizId === quizId) {
      quiz = data.quizzes[i];
      break;
    }
  }

  if (!quiz) {
    return { error: 'quiz ID does not refer to a valid quiz' };
  }

  let userOwnsQuiz = false;
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].quizId === quizId && data.quizzes[i].adminQuizId === authUserId) {
      userOwnsQuiz = true;
      break;
    }
  }
  if (!userOwnsQuiz) {
    return { error: 'quiz ID does not refer to a quiz that this user owns' };
  }

  if (description.length > 100) {
    return { error: 'Description must be under 100 characters' };
  }

  quiz.description = description;
  quiz.timeLastEdited = Math.round(Date.now() / 1000);
  setData(data);
  return {};
}

/**
  * Given a particular quiz, permanently remove the quiz
  *
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  * @param {number} quizId - A unique Id for the specified quiz
  *
  * @returns {{} | {error: string}} - Returns empty object if valid
 */
function adminQuizRemove (authUserId, quizId) {
  const data = getData();

  // AuthUserId is not a valid user
  if (!checkAuthUserId(authUserId)) {
    return { error: 'authUserId is not a valid user' };
  }
  
  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    return { error: 'quiz ID does not refer to a valid quiz' };
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return { error: 'quiz ID does not refer to a quiz that this user own' };
  }

  const length = data.quizzes.length;
  for (let index = 0; index < length; index++) {
    if (data.quizzes[index].quizId === quizId) {
      data.quizzes.splice(index, 1);
      break;
    }
  }

  setData(data);
  
  return {};
}

/**
  * Given basic details about a new quiz, create one for the logged in user
  *
  * @param {number} authUserId -  The unique Id for the user who is creating the quiz
  * @param {string} name - The name of new quiz
  * @param {string} description - The description for the new quiz

  *
  * @returns {{quizId: number} | {error: string}} - Returns an object containing the quizId
 */
function adminQuizCreate (authUserId, name, description) {

  // check valid userID
  if (!checkAuthUserId(authUserId)) {
    return { error: 'authUserId is not a valid user' };
  }

  // check name length
  if (name === null || name === '') {
    return { error: 'A name must be entered' };
  }

  if (name.length < 3 || name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters' };
  }

  // check name composition (alphanumeric and spaces)
  if (!checkAlphanumeric(name)) {
    return { error: 'Must use only alphanumeric characters or spaces in name' };
  };
   

  // check description length
  if (description.length > 100) {
    return { error: 'Description must be under 100 characters' };
  }

  // check if quiz name already in use by this user
  if (checkQuizNameUsed(authUserId, name)) {
    return { error: 'Quiz name is already in use' };
  }

  const data = getData();

  let maxID = 0;

  if (data.quizzes.length !== 0) {
    for (const quiz of data.quizzes) {
      if (quiz.quizId > maxID) {
        maxID = quiz.quizId;
      }
    }
    maxID = maxID + 1;
  }

  data.quizzes.push({
    quizId: maxID,
    adminQuizId: authUserId,
    name: name,
    timeCreated: Math.round(Date.now() / 1000),
    timeLastEdited: Math.round(Date.now() / 1000),
    description: description
  });

  setData(data);

  return {
    quizId: maxID
  };
}

/**
  * Provides a list of all quizzes that are owned by the currently logged in user
  *
  * @param {number} authUserId - The unique Id for the user who owns the quiz
  *
  * @returns {{quizzes: Array<{quizId: number, name: string}>} | {error: string}} - An array of quizzes and its details
 */
function adminQuizList (authUserId) {
  // check valid UserId
  if (!checkAuthUserIdValid(authUserId)) {
    return { error: 'authUserId is not a valid user' };
  }

  const data = getData();
  const output = {
    quizzes: [

    ]
  };

  // check all quizzes to see if its creater matches authUserId
  for (const quiz of data.quizzes) {
    if (quiz.adminQuizId === authUserId) {
      output.quizzes.push({
        quizId: quiz.quizId,
        name: quiz.name
      });
    }
  }

  return output;
}

/**
  * Update the name of the relevant quiz
  *
  * @param {number} authUserId - The unique Id for the user who owns the quiz
  * @param {number} quizId - The unique Id for the specified quiz
  * @param {string} name - The name that you want to change the quizzes name into
  *
  * @returns {{} | {error: string}} - Returns an empty object if valid
 */
function adminQuizNameUpdate (authUserId, quizId, name) {
  const data = getData();

  let user;
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].authUserId === authUserId) {
      user = data.users[i];
      break;
    }
  }
  if (!user) {
    return { error: 'authUserId is not a valid user' };
  }

  let quiz = null;
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].quizId === quizId) {
      quiz = data.quizzes[i];
      break;
    }
  }

  if (!quiz) {
    return { error: 'quiz ID does not refer to a valid quiz' };
  }

  let userOwnsQuiz = false;
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].quizId === quizId && data.quizzes[i].adminQuizId === authUserId) {
      userOwnsQuiz = true;
      break;
    }
  }
  if (!userOwnsQuiz) {
    return { error: 'quiz ID does not refer to a quiz that this user owns' };
  }

  if (/^[a-zA-Z0-9\s]+$/.test(name) === false) {
    return { error: 'Must use only alphanumeric characters or spaces in name' };
  }

  if (name.length < 3 || name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters long!' };
  }

  let userSameQuizName = false;
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].name === name && data.quizzes[i].adminQuizId === authUserId) {
      userSameQuizName = true;
      break;
    }
  }
  if (userSameQuizName === true) {
    return { error: 'Quiz name is already in use' };
  }

  quiz.name = name;
  quiz.timeLastEdited = Math.round(Date.now() / 1000);
  setData(data);
  return {};
}

/**
  * Get all of the relevant information about the current quiz
  *
  * @param {number} authUserId - The unique id of the registered user you are trying to look at the quizzes of
  * @param {number} quizId - The unique id of the quiz you are trying to trying to get information of
  *
  * @returns {{quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}} - An array of quizzes and its details
 */
function adminQuizInfo (authUserId, quizId) {
  const data = getData();

  if (!checkAuthUserIdValid(authUserId)) {
    return { error: 'authUserId is not a valid user' };
  }

  if (!checkQuizIdValid(quizId)) {
    return { error: 'quiz ID does not refer to a valid quiz' };
  }

  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return { error: 'quiz ID does not refer to a quiz that this user owns' };
  }

  // If no errors
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      return {
        quizId: quiz.quizId,
        name: quiz.name,
        timeCreated: quiz.timeCreated,
        timeLastEdited: quiz.timeLastEdited,
        description: quiz.description
      };
    }
  }

  // This block should not logically run
  return {
    error: ''
  };
}

/**
 * -------------------------------------- HELPERS FUNCTIONS-----------------------------------------------
 */

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
  *  Check if authUserId is valid and exists
  *
  * @param {number} authUserId - The specified authUserId
  *
  * @returns {boolean} - Returns true if authUserId is valid , otherwise, false
 */
function checkAuthUserId (authUserId) {
  const data = getData();
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
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

export { adminQuizDescriptionUpdate, adminQuizRemove, adminQuizNameUpdate, adminQuizList, adminQuizCreate, adminQuizInfo };
