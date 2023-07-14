import request from 'sync-request';
import { AdminQuizCreate, AdminQuizListReturn, AdminUserDetailsReturn, ErrorObj, Jwt, OkObj, Token, AdminQuizInfo, AdminQuestionDuplicate, QuizTrashReturn } from '../../interfaces/interfaces';
import { jwtToToken } from '../token';
import { getUrl } from '../helper';

const URL: string = getUrl();

export const registerUser = (email: string, password: string, nameFirst: string, nameLast:string): Token | ErrorObj => {
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

export const loginUser = (email: string, password: string): Token | ErrorObj => {
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

export const getUser = (jwt: Jwt): AdminUserDetailsReturn | ErrorObj => {
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

export const clearUsers = (): void => {
  request(
    'DELETE',
    URL + 'v1/clear'
  );
};

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

export const checkTokenValid = (token: Token, authUserId: number): boolean => {
  if (parseInt(token.sessionId) < 0 || parseInt(token.sessionId) > 10e6 || token.userId !== authUserId) return false;
  return true;
};

export const RequestCreateQuiz = (jwt: Jwt, name: string, description: string): AdminQuizCreate | ErrorObj => {
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

export const RequestRemoveQuiz = (jwt: Jwt, quizId: number): OkObj | ErrorObj => {
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

export const listQuiz = (jwt: Jwt): AdminQuizListReturn | ErrorObj => {
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

export const deleteQuestion = (jwt: Jwt, quizId: number, questionId: number): OkObj | ErrorObj => {
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

export const infoQuiz = (jwt: Jwt, quizId: number): AdminQuizInfo | ErrorObj => {
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

export const updateNameQuiz = (jwt: Jwt, name: string, quizId: number): OkObj | ErrorObj => {
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

export const updateDescriptionQuiz = (jwt: Jwt, description: string, quizId: number): OkObj | ErrorObj => {
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

export const duplicateQuiz = (jwt: Jwt, quizId: number, questionId: number): AdminQuestionDuplicate | ErrorObj => {
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

export function moveQuestion(quizId: number, questionId: number, newPosition: number, jwt: Jwt) {
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

  const parsedResponse: QuizTrashReturn | ErrorObj = JSON.parse(res.body.toString());

  return parsedResponse;
};
