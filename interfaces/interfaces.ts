
export interface Data {
    users: User[];
    quizzes: Quiz[];
    session: Token[];
}

export interface User {
    authUserId: number;
    nameFirst: string;
    nameLast: string;
    email: string;
    password: string;
    numSuccessLogins: number;
    numFailedPasswordsSinceLastLogin: number;
    deletedQuizzes: Quiz[];
}

export type JwtToken = string;
export interface Quiz extends AdminQuizInfo {
    adminQuizId: number;
}
export interface AdminQuizInfo {
    quizId: number;
    name: string;
    timeCreated: number;
    timeLastEdited: number;
    description: string;
    numQuestions: number;
    questions: Question[];
    duration: number;
}

export interface Question extends QuestionBody {
    questionId: number;
}

export interface QuestionBody {
    question: string;
    duration: number;
    points: number;
    answers: Answer[];
}

export interface Answer {
    answerId: number;
    answer: string;
    colour: string;
    correct: boolean;
}


export interface Token { 
    sessionId: string;
    userId: number;
}

export interface QuizToken {
    jwt: Jwt;
    name: string;
}

export interface ErrorObj {
    error: string;
}

export interface OkObj {
    
}

export interface ErrorAndStatusCode {
    error: string;
    statusCode: number;
}

export type AdminQuizDescriptionUpdateReturn = AdminQuizDescriptionUpdate | ErrorObj;
export type AdminQuizRemoveReturn = AdminQuizRemove | ErrorObj;
export type AdminQuizCreateReturn = AdminQuizCreate | ErrorAndStatusCode;
export type AdminQuizListReturn = AdminQuizList;
export type AdminQuizNameUpdateReturn = AdminQuizNameUpdate | ErrorObj;
export type AdminQuizInfoReturn = AdminQuizInfo | ErrorObj;
export type AdminAuthLoginReturn = AdminAuthLogin | ErrorObj;
export type AdminAuthRegisterReturn = AdminAuthRegister | ErrorObj;
export type AdminUserDetailsReturn = AdminUserDetails;
export type AdminUserALLDetailsReturn = AdminUserALLDetails | ErrorObj;
export type AdminQuizALLDetailsReturn = AdminQuizALLDetails | ErrorObj;
export type AdminUpdateUserDetailsReturn = AdminUpdateUserDetails| ErrorObj;
export type adminUpdateUserPasswordReturn = AdminUpdateUserPassword| ErrorObj;
export type AdminQuizRestoreReturn = AdminQuizRestore| ErrorObj;
export type AdminQuizEmptyTrashReturn = AdminQuizEmptyTrash| ErrorObj;
export type AdminQuizTransferReturn = AdminQuizTransfer| ErrorObj;
export type viewUserDeletedQuizzesReturn = Quiz[] | ErrorObj;

export interface Jwt {
    token: JwtToken;
}

export interface ClearReturn {

}

export interface AdminQuizDescriptionUpdate {

}

export interface AdminQuizRemove {

}

export interface AdminQuizRestore {

}

export interface AdminQuizEmptyTrash {
    
}

export interface AdminQuizTransfer {
    
}
export interface AdminQuizCreate {
    quizId: number;
} 

export type AdminQuizListReturnDescription = {
    quizId: number;
    name: string;
}

export interface AdminQuizList {
    quizzes: AdminQuizListReturnDescription[];
}


export interface AdminQuizNameUpdate {

}

export interface AdminAuthRegister {
    authUserId: number;
}

type AdminUserDetailsReturnDetails = {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
}

export interface AdminUserDetails {
    user: AdminUserDetailsReturnDetails;
}

export interface AdminUserALLDetails {
    user: User;
}

export interface AdminQuizALLDetails {
    quizzes: Quiz;
}

export interface AdminAuthLogin {
    authUserId: number;
}

export interface AdminUpdateUserDetails {

}

export interface AdminUpdateUserPassword {

}

export interface AdminAuthLogout {

}

export interface QuizQuestionCreate {
    questionId: number;
}