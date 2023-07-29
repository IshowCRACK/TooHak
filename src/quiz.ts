import {
  Data, AdminQuizListReturn, AdminQuizList, Jwt, ErrorAndStatusCode, AdminQuizCreate, OkObj,
  AdminQuizInfo, User, Quiz, QuizTrashReturn, Token, States, Actions, QuizSession, QuizMetadata
} from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import {
  checkAlphanumeric, checkQuizAndUserIdValid, checkQuizIdValid, checkQuizNameUsed,
  checkTokenValidStructure, checkTokenValidSession, checkNameUsedInQuiz, checkQuizIdAndUserIdValidAndTrash,
  checkQuizIdValidAndTrash, createQuizId, checkMaxNumSessions, checkQuizHasQuestions, isActionValid
} from './helper';
import { createQuizSession, jwtToToken } from './token';
import HTTPError from 'http-errors';
import request from 'sync-request';

// Update the description of the relevant quiz
export function adminQuizDescriptionUpdate (jwt: Jwt, description: string, quizId: number): OkObj | ErrorAndStatusCode {
  const data: Data = getData();

  // Check valid structure
  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }

  // Check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  const authUserId: number = jwtToToken(jwt).userId;

  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  if (description.length > 100) {
    throw HTTPError(400, 'Description must be under 100 characters');
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
    throw HTTPError(401, 'Token is not a valid structure');
  }
  // Check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  const authUserId: number = jwtToToken(jwt).userId;

  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
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

// Given a User token, view the deleted quizes
export function quizTrash(jwt: Jwt): QuizTrashReturn | ErrorAndStatusCode {
  // Check valid structure
  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }
  // Check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Provided token is valid structure, but is not for a currently logged in session');
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
    throw HTTPError(401, 'Token is not a valid structure');
  }

  //  Check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  // Check name length
  if (name === null || name === '') {
    throw HTTPError(400, 'A name must be entered');
  }

  if (name.length < 3 || name.length > 30) {
    throw HTTPError(400, 'Name must be between 3 and 30 characters');
  }

  // Check name composition (alphanumeric and spaces)
  if (!checkAlphanumeric(name)) {
    throw HTTPError(400, 'Must use only alphanumeric characters or spaces in name');
  }

  // Check description length
  if (description.length > 100) {
    throw HTTPError(400, 'Description must be under 100 characters');
  }

  const authUserId: number = jwtToToken(jwt).userId;

  // Check if quiz name already in use by this user
  if (checkQuizNameUsed(jwt, name)) {
    throw HTTPError(400, 'Quiz name is already in use');
  }

  const quizId = createQuizId();
  data.metaData.totalQuizzes++;

  data.quizzes.push({
    quizId: quizId,
    adminQuizId: authUserId,
    name: name,
    timeCreated: Math.round(Date.now() / 1000),
    timeLastEdited: Math.round(Date.now() / 1000),
    description: description,
    numQuestions: 0,
    questions: [],
    duration: 0,
    imgUrl: '',
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
    throw HTTPError(401, 'Token is not a valid structure');
  }

  // check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
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
    throw HTTPError(401, 'Token is not a valid structure');
  }

  //  check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }
  const authUserId: number = jwtToToken(jwt).userId;

  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  // Check name composition (alphanumeric and spaces)
  if (!checkAlphanumeric(name)) {
    throw HTTPError(400, 'Must use only alphanumeric characters or spaces in name');
  }

  // Check name length
  if (name.length < 3 || name.length > 30) {
    throw HTTPError(400, 'Name must be between 3 and 30 characters');
  }

  // Check if quiz name is already used by user
  if (checkQuizNameUsed(jwt, name)) {
    throw HTTPError(400, 'Quiz name is already in use');
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
    throw HTTPError(401, 'Token is not a valid structure');
  }

  // Check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  const authUserId: number = jwtToToken(jwt).userId;

  // Quiz ID does not refer to a valid quiz
  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (!checkQuizAndUserIdValid(quizId, authUserId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
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
    throw HTTPError(401, 'Token is not a valid structure');
  }

  // check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Provided token is valid structure, but is not for a currently logged in session');
  }
  const token: Token = jwtToToken(jwt);
  const data = getData();

  if (!checkQuizIdValidAndTrash(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (!checkQuizIdAndUserIdValidAndTrash(quizId, token.userId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const user: User = data.users.find((user) => user.authUserId === token.userId);
  const deletedQuizIndex = user.deletedQuizzes.findIndex(
    (quiz) => quiz.quizId === quizId
  );

  if (deletedQuizIndex === -1) {
    throw HTTPError(400, 'Quiz ID refers to a quiz that is not currently in the trash');
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
    throw HTTPError(401, 'Token is not a valid structure');
  }

  // Check if valid for active sessions
  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Provided token is valid structure, but is not for a currently logged in session');
  }

  const token: Token = jwtToToken(jwt);
  const data = getData();

  // if at least one quiz doesn't have a valid quizId
  if (quizIds.find((quizId: number) => !checkQuizIdValidAndTrash(quizId)) !== undefined) {
    throw HTTPError(400, 'One or more of the Quiz IDs is not a valid quiz');
  }

  // if at least one quiz doesn't have a valid correspondent user
  if (quizIds.find((quizId: number) => !checkQuizIdAndUserIdValidAndTrash(quizId, token.userId)) !== undefined) {
    throw HTTPError(400, 'One or more of the Quiz IDs refers to a quiz that this current user does not own');
  }

  const user: User = data.users.find((user) => user.authUserId === token.userId);

  for (const quizId of quizIds) {
    // Check if each quiz is in deleted quizzes
    if (user.deletedQuizzes.find((deletedQuiz: Quiz) => deletedQuiz.quizId === quizId) === undefined) {
      // Returns error if at least one quiz isn't in deleted quizes
      throw HTTPError(400, 'One or more of the Quiz IDs is not currently in the trash');
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
    throw HTTPError(401, 'Token is not a valid structure');
  }

  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (!checkQuizAndUserIdValid(quizId, jwtToToken(jwt).userId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  if (!targetUser) {
    throw HTTPError(400, 'userEmail is not a real user');
  }

  if (targetUser.authUserId === jwtToToken(jwt).userId) {
    throw HTTPError(400, 'userEmail is the current logged in user');
  }

  if (checkNameUsedInQuiz(quizId, targetUser.authUserId)) {
    throw HTTPError(400, 'Quiz ID refers to a quiz that has a name that is already used by the target user');
  }

  // Update the adminQuizId to the target user's authUserId
  const quizToUpdate = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);
  quizToUpdate.adminQuizId = targetUser.authUserId;
  setData(data);

  return {};
}

export function quizStartSession(jwt: Jwt, autoStartNum: number, quizId: number) {
  const token = jwtToToken(jwt);

  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (!checkQuizAndUserIdValid(quizId, jwtToToken(jwt).userId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  if (autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum is a number greater than 50');
  }

  if (!checkMaxNumSessions(token.userId)) {
    throw HTTPError(400, 'More than 10 active sessions');
  }

  if (!checkQuizHasQuestions(quizId)) {
    throw HTTPError(400, 'The quiz does not have any questions in it');
  }

  const quizSession = createQuizSession(token.userId, quizId, autoStartNum);

  const data = getData();
  data.quizSessions.push(quizSession);
  setData(data);

  return {
    sessionId: quizSession.sessionId
  };
}

export function createQuizThumbnail(jwt: Jwt, quizId: number, imgUrl: string) {
  const data = getData();

  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }

  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (!checkQuizAndUserIdValid(quizId, jwtToToken(jwt).userId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }
  if (imgUrl.includes(' ')) {
    throw HTTPError(400, 'imgUrl must be a valid file URL');
  }

  // Getting the image
  const ogImg = request(
    'GET',
    imgUrl
  );
  // Error if there is issue retrieving image
  if (ogImg.statusCode !== 200) {
    throw HTTPError(400, 'imgUrl must be a valid file URL');
  }

  if (!(/\.jpg$/.test(imgUrl) || /\.png$/.test(imgUrl))) {
    throw HTTPError(400, 'File is not a png or jpg file');
  }
  const quizToUpdate: Quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);
  quizToUpdate.imgUrl = imgUrl;
  setData(data);
  return {}; // Return an empty object if it passes the checks
}

// Updates the Quiz Session state
export function updateQuizSessionState(quizId: number, sessionId: number, jwt: Jwt, action: string): OkObj {
  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }

  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (!checkQuizAndUserIdValid(quizId, jwtToToken(jwt).userId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const data = getData();
  const quizSession = data.quizSessions.find(
    (session) => session.sessionId === sessionId && session.metadata.quizId === quizId
  );

  // If the quiz session is not found, return an error
  if (!quizSession) {
    throw HTTPError(400, 'Invalid quiz session or session not found');
  }

  // Get the current state of the quiz session
  const currentState = quizSession.state;

  // Convert the string action to an Actions enum value
  const actionEnum: Actions = Actions[action as keyof typeof Actions];

  // Define the valid transitions for each state
  const validTransitions: { [key in States]: Actions[] } = {
    [States.LOBBY]: [Actions.NEXT_QUESTION, Actions.END],
    [States.QUESTION_COUNTDOWN]: [Actions.END],
    [States.QUESTION_OPEN]: [Actions.END, Actions.GO_TO_ANSWER],
    [States.QUESTION_CLOSE]: [Actions.END, Actions.NEXT_QUESTION, Actions.GO_TO_ANSWER, Actions.GO_TO_FINAL_RESULTS],
    [States.ANSWER_SHOW]: [Actions.END, Actions.NEXT_QUESTION, Actions.GO_TO_FINAL_RESULTS],
    [States.FINAL_RESULTS]: [Actions.END],
    [States.END]: [],
  };

  // Check if the action is a valid enum value
  if (!isActionValid(action)) {
    throw HTTPError(400, 'Invalid action. Action must be one of the valid action strings.');
  }

  // Check if the provided action is a valid transition from the current state
  if (!validTransitions[currentState].includes(actionEnum)) {
    throw HTTPError(400, 'Action CANNOT be applied to current state');
  }
  let questionDuration: number;
  const countdownDuration = 1;
  const questionCount: number = quizSession.metadata.numQuestions;

  switch (action) {
    case Actions.NEXT_QUESTION:
      if (quizSession.atQuestion < questionCount) {
        questionDuration = quizSession.metadata.questions[quizSession.atQuestion].duration;
        quizSession.atQuestion = quizSession.atQuestion + 1;
        // Update the state to QUESTION_COUNTDOWN
        quizSession.state = States.QUESTION_COUNTDOWN;
        setData(data);
        // Start the countdown timer
        quizSession.countdownTimer = setTimeout(() => {
          quizSession.state = States.QUESTION_OPEN;
          setData(data);
          // Clear the countdown timer
          clearTimeout(quizSession.countdownTimer);
          quizSession.countdownTimer = undefined;
          // Start the question duration timer
          quizSession.questionTimer = setTimeout(() => {
            quizSession.state = States.QUESTION_CLOSE;
            setData(data);

            // Clear the question duration timer
            clearTimeout(quizSession.questionTimer);
            quizSession.questionTimer = undefined;
          }, questionDuration * 1000);
        }, countdownDuration * 1000);
      } else {
        // when no more questions go to END
        quizSession.state = States.END;
      }
      break;
    case Actions.GO_TO_ANSWER:
      // Update the state to ANSWER_SHOW
      clearTimeout(quizSession.questionTimer);
      clearTimeout(quizSession.countdownTimer);
      quizSession.questionTimer = undefined;
      quizSession.countdownTimer = undefined;

      quizSession.state = States.ANSWER_SHOW;
      setData(data);
      break;

    case Actions.GO_TO_FINAL_RESULTS:
      // Update the state to FINAL_RESULTS
      clearTimeout(quizSession.questionTimer);
      clearTimeout(quizSession.countdownTimer);
      quizSession.questionTimer = undefined;
      quizSession.countdownTimer = undefined;
      quizSession.state = States.FINAL_RESULTS;
      setData(data);
      break;

    case Actions.END:
      // Update the state to END
      clearTimeout(quizSession.questionTimer);
      clearTimeout(quizSession.countdownTimer);
      quizSession.questionTimer = undefined;
      quizSession.countdownTimer = undefined;
      quizSession.state = States.END;
      setData(data);
      break;
  }
  return {};
}

//  Returns the State of a Quiz (used for updatQuizSessionState TESTS)
//  --> turn this into "Get session status" & replace tests for updatQuizSessionState
export function getSessionStatus(quizId: number, sessionId: number, jwt: Jwt): QuizSession {
  if (!checkTokenValidStructure(jwt)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }

  if (!checkTokenValidSession(jwt)) {
    throw HTTPError(403, 'Token not for currently logged in session');
  }

  if (!checkQuizIdValid(quizId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (!checkQuizAndUserIdValid(quizId, jwtToToken(jwt).userId)) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const data = getData();
  const quizSession = data.quizSessions.find(
    (session) => session.sessionId === sessionId && session.metadata.quizId === quizId
  );

  // If the quiz session is not found, return an error
  if (!quizSession) {
    throw HTTPError(400, 'Invalid quiz session or session not found');
  }
  const quizMetaData: QuizMetadata = {
    quizId: quizSession.metadata.quizId,
    name: quizSession.metadata.name,
    timeCreated: quizSession.metadata.timeCreated,
    timeLastEdited: quizSession.metadata.timeLastEdited,
    description: quizSession.metadata.description,
    numQuestions: quizSession.metadata.numQuestions,
    questions: quizSession.metadata.questions,
    imgUrl: quizSession.metadata.imgUrl,
    duration: quizSession.metadata.duration,
  };

  const quizSessionReturn: QuizSession = {
    state: quizSession.state,
    atQuestion: quizSession.atQuestion,
    players: quizSession.players,
    metadata: quizMetaData,
  };
  return quizSessionReturn;
}
