import request from 'sync-request';
import {
  AdminQuizCreate, AdminQuizListReturn, AdminUserDetailsReturn, ErrorObj, Jwt, OkObj,
  Token, AdminQuizInfo, AdminQuestionDuplicate, QuizTrashReturn, QuestionBody
} from '../../interfaces/interfaces';
import { jwtToToken } from '../token';
import { getUrl } from '../helper';

const URL: string = getUrl();

// Passing request to route for adminAuthRegister
export const registerUserHandler = (email: string, password: string, nameFirst: string, nameLast:string): Token | ErrorObj => {
  const res = request(
    'POST',
    URL + 'v1/admin/auth/register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  const parsedResponse: Jwt | ErrorObj = JSON.parse(res.body.toString());

  if ('error' in parsedResponse) {
    return parsedResponse;
  } else {
    return jwtToToken(parsedResponse);
  }
};

// Passing request to route for adminAuthLogin
export const loginUserHandler = (email: string, password: string): Token | ErrorObj => {
  const res = request(
    'POST',
    URL + 'v1/admin/auth/login',
    {
      json: {
        email: email,
        password: password,
      }
    }
  );

  const parsedResponse: Jwt | ErrorObj = JSON.parse(res.body.toString());

  if ('error' in parsedResponse) {
    return parsedResponse;
  } else {
    return jwtToToken(parsedResponse);
  }
};

// Passing request to route for adminUserDetails
export const getUserHandler = (jwt: Jwt): AdminUserDetailsReturn | ErrorObj => {
  const res = request(
    'GET',
    URL + 'v1/admin/user/details',
    {
      qs: {
        token: jwt.token
      }
    }
  );
  const parsedResponse: AdminUserDetailsReturn | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Passing request to route for clear
export const clearUsersHandler = (): void => {
  request(
    'DELETE',
    URL + 'v1/clear'
  );
};

// Passing request to route for adminAuthLogout
export const logoutUserHandler = (jwt: Jwt) => {
  const res = request(
    'POST',
    URL + 'v1/admin/auth/logout',
    {
      json: {
        token: jwt.token
      }
    }
  );

  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Checking validity of token
export const checkTokenValid = (token: Token, authUserId: number): boolean => {
  if (parseInt(token.sessionId) < 0 || parseInt(token.sessionId) > 10e6 || token.userId !== authUserId) return false;
  return true;
};

// Passing request to route for adminQuizCreate
export const createQuizHandler = (jwt: Jwt, name: string, description: string): AdminQuizCreate | ErrorObj => {
  const res = request(
    'POST',
    URL + 'v1/admin/quiz',
    {
      json: {
        token: jwt.token,
        name: name,
        description: description,
      }
    }
  );
  const parsedResponse: AdminQuizCreate | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Passing request to route for adminQuizRemove
export const removeQuizHandler = (jwt: Jwt, quizId: number): OkObj | ErrorObj => {
  const res = request(
    'DELETE',
    URL + `v1/admin/quiz/${quizId}`,
    {
      qs: {
        token: jwt.token,
      }
    }
  );
  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());
  return parsedResponse;
};

// Passing request to route for adminQuizList
export const listQuizHandler = (jwt: Jwt): AdminQuizListReturn | ErrorObj => {
  const res = request(
    'GET',
    URL + 'v1/admin/quiz/list',
    {
      qs: {
        token: jwt.token
      }
    }
  );
  const parsedResponse: AdminQuizListReturn | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Passing request to route for adminQuizDelete
export const deleteQuestionHandler = (jwt: Jwt, quizId: number, questionId: number): OkObj | ErrorObj => {
  const res = request(
    'DELETE',
    URL + `v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      qs: {
        token: jwt.token
      }
    }
  );
  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Passing request to route for adminQuizTransfer
export const quizTransferHandler = (jwt: Jwt, email: string, quizId: number): OkObj | ErrorObj => {
  const res = request(
    'POST',
    URL + `v1/admin/quiz/${quizId}/transfer`,
    {
      json: {
        token: jwt.token,
        userEmail: email
      }
    }
  );
  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Passing request to route for adminQuizInfo
export const infoQuizHandler = (jwt: Jwt, quizId: number): AdminQuizInfo | ErrorObj => {
  const res = request(
    'GET',
    URL + `v1/admin/quiz/${quizId}`,
    {
      qs: {
        token: jwt.token,
      }
    }
  );

  const parsedResponse: AdminQuizInfo | ErrorObj = JSON.parse(res.body.toString());
  return parsedResponse;
};

// Passing request to route for adminQuizNameUpdate
export const updateNameQuizHandler = (jwt: Jwt, name: string, quizId: number): OkObj | ErrorObj => {
  const res = request(
    'PUT',
    URL + `v1/admin/quiz/${quizId}/name`,
    {
      json: {
        token: jwt.token,
        name: name
      }
    }
  );
  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());
  return parsedResponse;
};

// Passing request to route for adminQuizDescriptionUpdate
export const updateDescriptionQuizHandler = (jwt: Jwt, description: string, quizId: number): OkObj | ErrorObj => {
  const res = request(
    'PUT',
    URL + `v1/admin/quiz/${quizId}/description`,
    {
      json: {
        token: jwt.token,
        description: description
      }
    }
  );
  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());
  return parsedResponse;
};

export const updateDetailsAuthHandler = (jwt: Jwt, email: string, nameFirst: string, nameLast: string): OkObj | ErrorObj => {
  const res = request(
    'PUT',
    URL + 'v1/admin/user/details',
    {
      json: {
        token: jwt.token,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast
      }
    }
  );
  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());
  return parsedResponse;
};

// Passing request to route for quizDuplicateQuestion
export const duplicateQuizQuestionHandler = (jwt: Jwt, quizId: number, questionId: number): AdminQuestionDuplicate | ErrorObj => {
  const res = request(
    'POST',
    URL + `v1/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      json: {
        token: jwt.token
      }
    }
  );
  const parsedResponse: AdminQuestionDuplicate | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Passing request to route for quizTrash
export const viewQuizTrashHandler = (jwt: Jwt): QuizTrashReturn | ErrorObj => {
  const res = request(
    'GET',
    URL + 'v1/admin/quiz/trash',
    {
      qs: {
        token: jwt.token
      }
    }
  );

  const parsedResponse: QuizTrashReturn | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Passing request to route for quizmoveQuestionHandler
export function moveQuestionHandler(quizId: number, questionId: number, newPosition: number, jwt: Jwt) {
  const res = request(
    'PUT',
    URL + `v1/admin/quiz/${quizId}/question/${questionId}/move`,
    {
      json: {
        token: jwt.token,
        newPosition: newPosition
      }
    }
  );

  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
}

// Passing request to route for quizUpdateQuestion
export const updateQuizHandler = (
  jwt: Jwt, questionBody: QuestionBody, quizId: number, questionId: number
): OkObj | ErrorObj => {
  const res = request(
    'PUT',
    URL + `v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      json: {
        token: jwt.token,
        questionBody: questionBody
      }
    }
  );
  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Passing request to route for adminQuizRestore
export const trashRestoreQuizHandler = (jwt: Jwt, quizId: number): OkObj | ErrorObj => {
  const res = request(
    'POST',
    URL + `v1/admin/quiz/${quizId}/restore`,
    {
      json: {
        token: jwt.token
      }
    }
  );

  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};

// Passing request to route for adminQuizEmptyTrash
export const emptyTrashHandler = (jwt: Jwt, quizIds: number[]): OkObj | ErrorObj => {
  const res = request(
    'DELETE',
    URL + 'v1/admin/quiz/trash/empty',
    {
      qs: {
        token: jwt.token,
        quizIds: quizIds
      }
    }
  );

  const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};
