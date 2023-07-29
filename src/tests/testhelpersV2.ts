import request, { HttpVerb } from 'sync-request';
import { AdminQuizCreate, AdminQuizListReturn, ErrorObj, Jwt, OkObj, AdminQuizInfo, OkSessionObj, QuestionBody, QuizQuestionCreate, AdminQuestionDuplicate, QuizTrashReturn } from '../../interfaces/interfaces';
import { getUrl } from '../helper';

const URL: string = getUrl();

const requestHelper = (method: HttpVerb, path: string, payload: object, jwt?: Jwt) => {
  let qs = {};
  let json = {};
  let headers = {};

  if (jwt) {
    headers = { token: jwt.token };
  }

  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }

  const res = request(method, URL + path, { qs, json, headers });

  return JSON.parse(res.body.toString());
};
//  ///////////////////// NEW ITR3  ////////////////////////////////////////

export const createQuizThumbnailHandler = (jwt: Jwt, quizId: number, imgUrl: string): OkObj | ErrorObj => {
  return requestHelper('POST', `v1/admin/quiz/${quizId}/thumbnail`, { imgUrl }, jwt);
};

export const updateQuizSessionStateHandler = (quizId: number, sessionId: number, jwt: Jwt, action: string): OkObj | ErrorObj => {
  return requestHelper('PUT', `v1/admin/quiz/${quizId}/session/${sessionId}`, { action }, jwt);
};

export const getSessionStatusHandler = (quizId: number, sessionId: number, jwt:Jwt): string | ErrorObj => {
  return requestHelper('GET', `v1/admin/quiz/${quizId}/session/${sessionId}`, {}, jwt);
};

//  ////////////////////  MODIFIED ITR3 ////////////////////////////////////
export const logoutUserHandlerV2 = (jwt: Jwt) => {
  return requestHelper('POST', 'v2/admin/auth/logout', {}, jwt);
};

export const getUserV2 = (jwt: Jwt) => {
  return requestHelper('GET', 'v2/admin/user/details', {}, jwt);
};

export const updateDetailsAuthHandlerV2 = (jwt: Jwt, email: string, nameFirst: string, nameLast: string) => {
  return requestHelper('PUT', 'v2/admin/user/details', { email, nameFirst, nameLast }, jwt);
};

export const updateUserDetailsPasswordV2 = (jwt: Jwt, oldPassword: string, newPassword: string): OkObj | ErrorObj => {
  return requestHelper('PUT', 'v2/admin/user/password', { oldPassword, newPassword }, jwt);
};

export const RequestCreateQuizV2 = (jwt: Jwt, name: string, description: string): AdminQuizCreate | ErrorObj => {
  return requestHelper('POST', 'v2/admin/quiz', { name, description }, jwt);
};

export const listQuizV2 = (jwt: Jwt): AdminQuizListReturn | ErrorObj => {
  return requestHelper('GET', 'v2/admin/quiz/list', {}, jwt);
};

export const RequestRemoveQuizV2 = (jwt: Jwt, quizId: number): OkObj | ErrorObj => {
  return requestHelper('DELETE', `v2/admin/quiz/${quizId}`, {}, jwt);
};

export const infoQuizV2 = (jwt: Jwt, quizId: number): AdminQuizInfo | ErrorObj => {
  return requestHelper('GET', `v2/admin/quiz/${quizId}`, {}, jwt);
};

export const updateNameQuizV2 = (jwt: Jwt, name: string, quizId: number): OkObj | ErrorObj => {
  return requestHelper('PUT', `v2/admin/quiz/${quizId}/name`, { name }, jwt);
};

export const startSessionQuiz = (jwt: Jwt, autoStartNum: number, quizId: number): OkSessionObj | ErrorObj => {
  return requestHelper('POST', `v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, jwt);
};

export const createQuizQuestionHandlerV2 = (quizId: number, jwt: Jwt, questionBody: QuestionBody): QuizQuestionCreate | ErrorObj => {
  return requestHelper('POST', `v2/admin/quiz/${quizId}/question`, { questionBody }, jwt);
};

export const deleteQuestionV2 = (jwt: Jwt, quizId: number, questionId: number): OkObj | ErrorObj => {
  return requestHelper('DELETE', `v2/admin/quiz/${quizId}/question/${questionId}`, {}, jwt);
};

export function moveQuestionV2(quizId: number, questionId: number, newPosition: number, jwt: Jwt): OkObj | ErrorObj {
  return requestHelper('PUT', `v2/admin/quiz/${quizId}/question/${questionId}/move`, { newPosition }, jwt);
}

export const duplicateQuizV2 = (jwt: Jwt, quizId: number, questionId: number): AdminQuestionDuplicate | ErrorObj => {
  return requestHelper('POST', `v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {}, jwt);
};

export const updateQuizV2 = (jwt: Jwt, questionBody: QuestionBody, quizId: number, questionId: number): OkObj | ErrorObj => {
  return requestHelper('PUT', `v2/admin/quiz/${quizId}/question/${questionId}`, { questionBody }, jwt);
};

export const updateDescriptionQuizV2 = (jwt: Jwt, description: string, quizId: number): OkObj | ErrorObj => {
  return requestHelper('PUT', `v2/admin/quiz/${quizId}/description`, { description }, jwt);
};

export const viewQuizTrashHandlerV2 = (jwt: Jwt): QuizTrashReturn | ErrorObj => {
  return requestHelper('GET', 'v2/admin/quiz/trash', {}, jwt);
};

export const trashRestoreQuizHandlerV2 = (jwt: Jwt, quizId: number): OkObj | ErrorObj => {
  return requestHelper('POST', `v2/admin/quiz/${quizId}/restore`, {}, jwt);
};

export const emptyTrashHandlerV2 = (jwt: Jwt, quizIds: number[]): OkObj | ErrorObj => {
  return requestHelper('DELETE', 'v2/admin/quiz/trash/empty', { quizIds }, jwt);
};

export const quizTransferHandlerV2 = (jwt: Jwt, email: string, quizId: number): OkObj | ErrorObj => {
  return requestHelper('POST', `v2/admin/quiz/${quizId}/transfer`, { email }, jwt);
};
