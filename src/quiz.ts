import {
  Data, AdminQuizListReturn, AdminQuizList,Jwt, ErrorAndStatusCode, AdminQuizCreate, OkObj,
  AdminQuizInfo, User, Quiz, QuizTrashReturn, Token,
} from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import {
  checkAlphanumeric, checkQuizAndUserIdValid, checkQuizIdValid, checkQuizNameUsed,
  checkTokenValidStructure, checkTokenValidSession, checkNameUsedInQuiz, checkQuizIdAndUserIdValidAndTrash,
  checkQuizIdValidAndTrash, createQuizId
} from './helper';
import { jwtToToken } from './token';

// Update the description of the relevant quiz
export function adminQuizDescriptionUpdate (jwt: Jwt, description: string, quizId: number): OkObj | ErrorAndStatusCode {
  const data: Data = getData();

  // Check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  // Check if valid for active sessions
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

  if (description.length > 100) {
    return {
      error: 'Description must be under 100 characters',
      statusCode: 400
    };
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


// Given a particular quiz, permanently remove the quiz
export function adminQuizRemove (jwt: Jwt, quizId: number): OkObj | ErrorAndStatusCode {
  const data = getData();

  // Check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }
  // Check if valid for active sessions
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
    // Initialize deletedQuizzes array if it doesn't exist
    user.deletedQuizzes = []; 
  }

  user.deletedQuizzes.push(deletedQuiz);
  data.quizzes.splice(quizIndex, 1);
  setData(data);

  return {};
}

// Given a UserId, view the deleted quizes
export function quizTrash(jwt: Jwt): QuizTrashReturn | ErrorAndStatusCode {
  // Check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }
  // Check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Provided token is valid structure, but is not for a currently logged in session',
      statusCode: 403
    };
  }

  const data = getData();

  const user = data.users.find((user) => user.authUserId === jwtToToken(jwt).userId);

  const userDeletedQuizzes = user.deletedQuizzes.map((quiz: Quiz) => {
    return {
      quizId: quiz.quizId,
      name: quiz.name
    };
  });

  return {
    quizzes: userDeletedQuizzes
  };
}

// Given basic details about a new quiz, create one for the logged in user
export function adminQuizCreate (jwt: Jwt, name: string, description: string): AdminQuizCreate | ErrorAndStatusCode {
  const data = getData();
  // Check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  //  Check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Token not for currently logged in session',
      statusCode: 403
    };
  }

  // Check name length
  if (name === null || name === '') {
    return { error: 'A name must be entered', statusCode: 400 };
  }

  if (name.length < 3 || name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters', statusCode: 400 };
  }

  // Check name composition (alphanumeric and spaces)
  if (!checkAlphanumeric(name)) {
    return { error: 'Must use only alphanumeric characters or spaces in name', statusCode: 400 };
  }

  // Check description length
  if (description.length > 100) {
    return { error: 'Description must be under 100 characters', statusCode: 400 };
  }

  const authUserId: number = jwtToToken(jwt).userId;

  // Check if quiz name already in use by this user
  if (checkQuizNameUsed(jwt, name)) {
    return { error: 'Quiz name is already in use', statusCode: 400 };
  }

  const quizId = createQuizId();

  data.quizzes.push({
    quizId: quizId,
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
    quizId: quizId
  };
}

// Provides a list of all quizzes that are owned by the currently logged in user
export function adminQuizList (jwt: Jwt): AdminQuizListReturn | ErrorAndStatusCode {
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

// Update the name of the relevant quiz
export function adminQuizNameUpdate (jwt: Jwt, name: string, quizId: number): OkObj | ErrorAndStatusCode {
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

  // Check name composition (alphanumeric and spaces)
  if (!checkAlphanumeric(name)) {
    return {
      error: 'Must use only alphanumeric characters or spaces in name',
      statusCode: 400
    };
  }

  // Check name length
  if (name.length < 3 || name.length > 30) {
    return {
      error: 'Name must be between 3 and 30 characters',
      statusCode: 400
    };
  }

  // Check if quiz name is already used by user
  if (checkQuizNameUsed(jwt, name)) {
    return {
      error: 'Quiz name is already in use',
      statusCode: 400
    };
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

// Get all of the relevant information about the current quiz
export function adminQuizInfo (jwt: Jwt, quizId: number): AdminQuizInfo | ErrorAndStatusCode {
  const data = getData();

  // Check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  // Check if valid for active sessions
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

  // if no errors
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

// Restores a Quiz from the Trash
export function adminQuizRestore(jwt: Jwt, quizId: number): OkObj | ErrorAndStatusCode {
  // check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  // check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Provided token is valid structure, but is not for a currently logged in session',
      statusCode: 403
    };
  }
  const token: Token = jwtToToken(jwt);
  const data = getData();

  if (!checkQuizIdValidAndTrash(quizId)) {
    return {
      error: 'Quiz ID does not refer to a valid quiz',
      statusCode: 400
    };
  }

  if (!checkQuizIdAndUserIdValidAndTrash(quizId, token.userId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      statusCode: 400
    };
  }

  const user: User = data.users.find((user) => user.authUserId === token.userId);
  const deletedQuizIndex = user.deletedQuizzes.findIndex(
    (quiz) => quiz.quizId === quizId
  );

  if (deletedQuizIndex === -1) {
    return {
      error: 'Quiz ID refers to a quiz that is not currently in the trash',
      statusCode: 400
    };
  }

  const deletedQuiz = user.deletedQuizzes[deletedQuizIndex];

  // Remove the quiz from the deletedQuizzes array
  user.deletedQuizzes.splice(deletedQuizIndex, 1);

  // Add the quiz back to the quizzes array
  data.quizzes.push(deletedQuiz);
  setData(data);

  return {};
}

// Permanently clears 'deletedQuizzes'
export function adminQuizEmptyTrash(jwt: Jwt, quizIds: number[]): OkObj | ErrorAndStatusCode {
  // todo: ask about if theres an error, you don't delete any of them
  // Check valid structure
  if (!checkTokenValidStructure(jwt)) {
    return {
      error: 'Token is not a valid structure',
      statusCode: 401
    };
  }

  // Check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    return {
      error: 'Provided token is valid structure, but is not for a currently logged in session',
      statusCode: 403
    };
  }

  const token: Token = jwtToToken(jwt);
  const data = getData();

  // if at least one quiz doesn't have a valid quizId
  if (quizIds.find((quizId: number) => !checkQuizIdValidAndTrash(quizId)) !== undefined) {
    return {
      error: 'One or more of the Quiz IDs is not a valid quiz',
      statusCode: 400
    };
  }

  // if at least one quiz doesn't have a valid correspondent user
  if (quizIds.find((quizId: number) => !checkQuizIdAndUserIdValidAndTrash(quizId, token.userId)) !== undefined) {
    return {
      error: 'One or more of the Quiz IDs refers to a quiz that this current user does not own',
      statusCode: 400
    };
  }

  const user: User = data.users.find((user) => user.authUserId === token.userId);

  for (const quizId of quizIds) {
    // Check if each quiz is in deleted quizzes
    if (user.deletedQuizzes.find((deletedQuiz: Quiz) => deletedQuiz.quizId === quizId) === undefined) {
      // Returns error if at least one quiz isn't in deleted quizes
      return {
        error: 'One or more of the Quiz IDs is not currently in the trash',
        statusCode: 400
      };
    }
  }

  for (const quizId of quizIds) {
    // Find the quiz in the deletedQuizzes array
    const quizIndex = user.deletedQuizzes.findIndex((quiz) => quiz.quizId === quizId);

    // Remove the specified quizId from the user's deletedQuizzes array
    user.deletedQuizzes.splice(quizIndex, 1);
  }

  setData(data);

  return {};
}

// Transfers Quiz Ownership to another user
export function adminQuizTransfer(jwt: Jwt, email: string, quizId: number): OkObj | ErrorAndStatusCode {
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

  return {};
}
