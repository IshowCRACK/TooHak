import {
  Data, AdminQuizDescriptionUpdateReturn, AdminQuizListReturn,
  AdminQuizList, viewUserDeletedQuizzesReturn, AdminQuizRestoreReturn, AdminQuizEmptyTrashReturn,
  Jwt, ErrorAndStatusCode, AdminQuizCreate, OkObj, QuizToken, AdminQuizInfo, User, Quiz,

} from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import {
  checkAlphanumeric, checkAuthUserIdValid, checkQuizAndUserIdValid,
  checkQuizIdValid, checkQuizNameUsed, checkALLQuizOwnership, checkQuizIdExistsGlobally, checkTokenValidStructure, checkTokenValidSession, checkNameUsedInQuiz
} from './helper';
import { jwtToToken } from './token';

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
  * @param {Jwt} jwt - A unique session Id
  * @param {number} quizId - A unique Id for the specified quiz
  *
  * @returns {{} | {error: string}} - Returns empty object if valid
 */
function adminQuizRemove (jwt: Jwt, quizId: number): OkObj | ErrorAndStatusCode {
  const data = getData();

  //  check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }
  //  check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }

  const authUserId: number = jwtToToken(jwt).userId;

  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    return { error: 'Quiz ID does not refer to a valid quiz', statusCode: 400 };
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns', statusCode: 400 };
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
  * @param {number} token -  The token of the active session
  * @param {string} name - The name of new quiz
  * @param {string} description - The description for the new quiz

  *
  * @returns {{quizId: number} | {error: string}} - Returns an object containing the quizId
 */
function adminQuizCreate (jwt: Jwt, name: string, description: string): AdminQuizCreate | ErrorAndStatusCode {
  const data = getData();
  // check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }
  //  check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }
  // check name length
  if (name === null || name === '') {
    return { error: 'A name must be entered', statusCode: 400 };
  }

  if (name.length < 3 || name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters', statusCode: 400 };
  }

  // check name composition (alphanumeric and spaces)
  if (!checkAlphanumeric(name)) {
    return { error: 'Must use only alphanumeric characters or spaces in name', statusCode: 400 };
  }

  // check description length
  if (description.length > 100) {
    return { error: 'Description must be under 100 characters', statusCode: 400 };
  }
  const authUserId: number = jwtToToken(jwt).userId;
  // check if quiz name already in use by this user
  if (checkQuizNameUsed(jwt, name)) {
    return { error: 'Quiz name is already in use', statusCode: 400 };
  }

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
    description: description,
    numQuestions: 0,
    questions: [],
    duration: 0
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
function adminQuizList (jwt: Jwt): AdminQuizListReturn | ErrorAndStatusCode {
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

  const data = getData();
  const output: AdminQuizList = {
    quizzes: [

    ]
  };

  // check all quizzes to see if its creater matches authUserId
  for (const quiz of data.quizzes) {
    if (quiz.adminQuizId === jwtToToken(jwt).userId) {
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
function adminQuizNameUpdate (quizToken: QuizToken, quizId: number) {
  const data = getData();

  // AuthUserId is not a valid user
  const authUserId = jwtToToken(quizToken.jwt).userId;
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
  if (!checkAlphanumeric(quizToken.name)) {
    return { error: 'Must use only alphanumeric characters or spaces in name' };
  }

  // Check name length
  if (quizToken.name.length < 3 || quizToken.name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters long!' };
  }

  // Check if quiz name is already used by user
  if (checkQuizNameUsed(quizToken.jwt, quizToken.name)) {
    return { error: 'Quiz name already in use' };
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.name = quizToken.name;
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
function adminQuizInfo (jwt: Jwt, quizId: number): AdminQuizInfo | ErrorAndStatusCode {
  const data = getData();

  //  check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  //  check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }

  const authUserId: number = jwtToToken(jwt).userId;

  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    return {
      error: 'Quiz ID does not refer to a valid quiz',
      statusCode: 400
    };
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      statusCode: 400
    };
  }

  // If no errors
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      return {
        quizId: quiz.quizId,
        name: quiz.name,
        timeCreated: quiz.timeCreated,
        timeLastEdited: quiz.timeLastEdited,
        description: quiz.description,
        numQuestions: quiz.numQuestions,
        questions: quiz.questions,
        duration: quiz.duration
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
    return { error: 'Quiz ID refers to a quiz that is not currently in the trash or invalid Quiz ID' };
  }

  const deletedQuiz = data.users[userIndex].deletedQuizzes[deletedQuizIndex];

  // Remove the quiz from the deletedQuizzes array
  data.users[userIndex].deletedQuizzes.splice(deletedQuizIndex, 1);

  // Add the quiz back to the quizzes array
  data.quizzes.push(deletedQuiz);

  setData(data);

  return {};
}

/**
  * Permanently clears 'deletedQuizzes'
  *
  * @param {number} authUserId - The unique id of the registered user
  * @param {number[]} quizIds - An array of quizId's to be deleted from the trash
  *
  * @returns {{} | {error: string}} - Returns an empty object if valid
 */
function adminQuizEmptyTrash(authUserId: number, quizIds: number[]): AdminQuizEmptyTrashReturn {
  const data = getData();

  // Find the user in the users array
  const userIndex = data.users.findIndex((user) => user.authUserId === authUserId);

  if (userIndex !== -1) {
    const user = data.users[userIndex];

    for (const quizId of quizIds) {
      // Check if the specified quizId is a valid quiz
      if (!checkQuizIdExistsGlobally(quizId)) {
        return { error: 'One or more of the Quiz IDs is not a valid quiz' };
      }

      // Check if the user owns the specified quiz
      if (!checkALLQuizOwnership(authUserId, quizId)) {
        return {
          error: 'One or more of the Quiz IDs refers to a quiz that this current user does not own',
        };
      }

      // Find the quiz in the deletedQuizzes array
      const quizIndex = user.deletedQuizzes.findIndex((quiz) => quiz.quizId === quizId);

      // Check if the specified quizId is currently in the trash
      if (quizIndex === -1) {
        return { error: 'One or more of the Quiz IDs is not currently in the trash' };
      }

      // Remove the specified quizId from the user's deletedQuizzes array
      user.deletedQuizzes.splice(quizIndex, 1);
    }
  } else {
    return { error: 'AuthUserId is not a valid user' };
  }
  setData(data);
  return {};
}

/**
  * Transfers Quiz Ownership to another user
  * @param {number} authUserId - The unique id of the user in session
  * @param {number} quizId - The unique id of the quiz to be transfered
  * @param {string} email - email of target user (quiz is being transfered to this user)
  *
  * @returns {{} | {error: string}} - Returns an empty object if valid
 */
function adminQuizTransfer(jwt: Jwt, email: string, quizId: number): OkObj | ErrorAndStatusCode {
  const data = getData();
  const targetUser = data.users.find((user: User) => user.email === email);

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

  if (!checkQuizIdValid(quizId)) {
    return {
      error: 'Quiz ID does not refer to a valid quiz',
      statusCode: 400
    };
  }

  if (!checkQuizAndUserIdValid(quizId, jwtToToken(jwt).userId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      statusCode: 400
    };
  }

  if (!targetUser) {
    return {
      error: 'userEmail is not a real user',
      statusCode: 400
    };
  }

  if (targetUser.authUserId === jwtToToken(jwt).userId) {
    return {
      error: 'userEmail is the current logged in user',
      statusCode: 400
    };
  }

  if (checkNameUsedInQuiz(quizId, targetUser.authUserId)) {
    return {
      error: 'Quiz ID refers to a quiz that has a name that is already used by the target user',
      statusCode: 400
    };
  }

  // Update the adminQuizId to the target user's authUserId
  const quizToUpdate = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);
  quizToUpdate.adminQuizId = targetUser.authUserId;

  // setData(data);
  return {};
}

export { adminQuizDescriptionUpdate, adminQuizRemove, adminQuizNameUpdate, adminQuizList, adminQuizCreate, adminQuizInfo, viewUserDeletedQuizzes, adminQuizRestore, adminQuizEmptyTrash, adminQuizTransfer };
