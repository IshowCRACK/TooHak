

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

export interface Quiz {
    quizId: number;
    adminQuizId: number;
    name: string;
    timeCreated: number;
    timeLastEdited: number;
    description: string;
}

export interface Data {
    users: User[];
    quizzes: Quiz[];
}

export interface Error {
    error: string;
    statuCode?: number;
}

export type AdminQuizDescriptionUpdateReturn = AdminQuizDescriptionUpdate | Error;
export type AdminQuizRemoveReturn = AdminQuizRemove | Error;
export type AdminQuizCreateReturn = AdminQuizCreate | Error;
export type AdminQuizListReturn = AdminQuizList | Error;
export type AdminQuizNameUpdateReturn = AdminQuizNameUpdate | Error;
export type AdminQuizInfoReturn = AdminQuizInfo | Error;
export type AdminAuthLoginReturn = AdminAuthLogin | Error;
export type AdminAuthRegisterReturn = AdminAuthRegister | Error;
export type AdminUserDetailsReturn = AdminUserDetails | Error;
export type AdminUserALLDetailsReturn = AdminUserALLDetails | Error;
export type AdminUpdateUserDetailsReturn = AdminUpdateUserDetails| Error;
export type adminUpdateUserPasswordReturn = adminUpdateUserPassword| Error;
export type viewUserDeletedQuizzesReturn = Quiz[] | Error;

export interface ClearReturn {

}

export interface AdminQuizDescriptionUpdate {

}

export interface AdminQuizRemove {

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

export interface AdminQuizInfo {
    quizId: number;
    name: string;
    timeCreated: number;
    timeLastEdited: number;
    description: string;
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

export interface AdminAuthLogin {
    authUserId: number;
}

export interface AdminUpdateUserDetails {

}

export interface adminUpdateUserPassword {

}
