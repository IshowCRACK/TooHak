import { getData, setData } from './dataStore.js';
import {
  checkAlphanumeric, checkAuthUserIdValid, checkQuizAndUserIdValid,
  checkQuizIdValid, checkQuizNameUsed
} from './helper.js';

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
  // AuthUserId is not a valid user
  if (!checkAuthUserIdValid(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  if (description.length > 100) {
    return { error: 'Description must be under 100 characters' };
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.description = description;
      quiz.timeLastEdited = Math.round(Date.now() / 1000);
    }
  }

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
  if (!checkAuthUserIdValid(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
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
  if (!checkAuthUserIdValid(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
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
    return { error: 'AuthUserId is not a valid user' };
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

  // AuthUserId is not a valid user
  if (!checkAuthUserIdValid(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  // Quiz ID does not refer to a valid quizthat this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  // Check name composition (alphanumeric and spaces)
  if (!checkAlphanumeric(name)) {
    return { error: 'Must use only alphanumeric characters or spaces in name' };
  };

  // Check name length
  if (name.length < 3 || name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters long!' };
  }

  // Check if quiz name is already used by user
  if (checkQuizNameUsed(authUserId, name)) {
    return { error: 'Quiz name already in use' };
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.name = name;
      quiz.timeLastEdited = Math.round(Date.now() / 1000);
    }
  }

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
    return { error: 'AuthUserId is not a valid user' };
  }

  if (!checkQuizIdValid(quizId)) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
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
}

export { adminQuizDescriptionUpdate, adminQuizRemove, adminQuizNameUpdate, adminQuizList, adminQuizCreate, adminQuizInfo };
