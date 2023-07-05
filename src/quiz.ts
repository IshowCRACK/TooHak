import { Data, AdminQuizDescriptionUpdateReturn, AdminQuizRemoveReturn, AdminQuizCreateReturn, AdminQuizListReturn, AdminQuizList, AdminQuizInfoReturn, viewUserDeletedQuizzesReturn, AdminQuizRestoreReturn } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import {
  checkAlphanumeric, checkAuthUserIdValid, checkQuizAndUserIdValid,
  checkQuizIdValid, checkQuizNameUsed, adminUserALLDetails
} from './helper';

/**
  * Update the description of the relevant quiz
  *
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  * @param {number} quizId - A unique Id for the specified quiz
  * @param {string} description - Quiz description
  *
  * @returns {{} | {error: string}} - Returns an empty object if valid
 */
function adminQuizDescriptionUpdate (authUserId: number, quizId: number, description: string): AdminQuizDescriptionUpdateReturn {
  const data: Data = getData();
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
function adminQuizRemove (authUserId: number, quizId: number): AdminQuizRemoveReturn {
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

  const userIndex = data.users.findIndex((user) => user.authUserId === authUserId);
  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  const deletedQuiz = data.quizzes[quizIndex];
  const user = data.users[userIndex];

  if (!user.deletedQuizzes) {
    user.deletedQuizzes = []; // Initialize deletedQuizzes array if it doesn't exist
  }

  user.deletedQuizzes.push(deletedQuiz);
  data.quizzes.splice(quizIndex, 1);

  setData(data);
  return {};
}

/**
  * Given a UserId, view the deleted quizes
  *
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  *
  * @returns {Quiz[] | {error: string}} - Returns array if valid
 */
function viewUserDeletedQuizzes(authUserId: number): viewUserDeletedQuizzesReturn {
  const data = getData();

  if (!checkAuthUserIdValid(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  const user = data.users.find((user) => user.authUserId === authUserId);

  return user.deletedQuizzes;
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
function adminQuizCreate (authUserId: number, name: string, description: string): AdminQuizCreateReturn {
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
  }

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
function adminQuizList (authUserId: number): AdminQuizListReturn {
  // check valid UserId
  if (!checkAuthUserIdValid(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  const data = getData();
  const output: AdminQuizList = {
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
function adminQuizNameUpdate (authUserId: number, quizId: number, name: string) {
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
  }

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
  * @param {number} authUserId - The unique id of the registered user 
  * @param {number} quizId - The unique id of the quiz 
  *
  * @returns {{quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}} - An array of quizzes and its details
 */
function adminQuizInfo (authUserId: number, quizId: number): AdminQuizInfoReturn {
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

/**
  * Restores a Quiz from the Trash
  *
  * @param {number} authUserId - The unique id of the registered user 
  * @param {number} quizId - The unique id of the quiz 
  *
  * @returns {{} | {error: string}} - Returns an empty object if valid
 */
function adminQuizRestore(authUserId: number, quizId: number): AdminQuizRestoreReturn {
  const data = getData();

  // Check if authUserId is valid
  if (!checkAuthUserIdValid(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }

  const userIndex = data.users.findIndex((user) => user.authUserId === authUserId);
  const deletedQuizIndex = data.users[userIndex].deletedQuizzes.findIndex(
    (quiz) => quiz.quizId === quizId
  );
  if (deletedQuizIndex === -1) {
    return { error: 'Quiz ID refers to a quiz that is not currently in the trash' };
  }

  const deletedQuiz = data.users[userIndex].deletedQuizzes[deletedQuizIndex];

  // Remove the quiz from the deletedQuizzes array
  data.users[userIndex].deletedQuizzes.splice(deletedQuizIndex, 1);

  // Add the quiz back to the quizzes array
  data.quizzes.push(deletedQuiz);

  setData(data);

  return {};
}

export { adminQuizDescriptionUpdate, adminQuizRemove, adminQuizNameUpdate, adminQuizList, adminQuizCreate, adminQuizInfo, viewUserDeletedQuizzes, adminQuizRestore };
