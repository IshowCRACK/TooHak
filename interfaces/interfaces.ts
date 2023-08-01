
export interface Data {
    users: User[];
    quizzes: Quiz[];
    session: Token[]; // array of all people that are currently logged in
    quizSessions: QuizSessionAdmin[];
    metaData: MetaData;
    maxPlayerId: number;
}

export interface MetaData {
    totalUsers: number;
    totalQuizzes: number;
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
    prevPassword: string[];
}
export interface Player {
    playerId: number,
    name: string,
}

export interface QuizSessionAdmin extends QuizSession {
    sessionId: number;
    authUserId: number;
    playerInfo: Player[]
    autoStartNum: number;
    countdownTimer: ReturnType<typeof setTimeout> | undefined; // Timer for question countdown
    questionTimer: ReturnType<typeof setTimeout> | undefined; // Timer for question countdown
    playerAnswers: PlayerAnswer[]
}

export interface PlayerAnswer {
    playerId: number;
    questionId: number;
    answerIds: number;
    submissionTime: number;
    isCorrect: boolean;
}

export interface QuizSession {
    state: States;
    atQuestion: number;
    players: string[];
    metadata: QuizMetadata;
}


export enum States {
   LOBBY = "LOBBY",
   QUESTION_COUNTDOWN = "QUESTION_COUNTDOWN",
   QUESTION_OPEN = "QUESTION_OPEN",
   QUESTION_CLOSE = "QUESTION_CLOSE",
   ANSWER_SHOW = "ANSWER_SHOW",
   FINAL_RESULTS = "FINAL_RESULTS",
   END = "END"
}

export enum Actions {
    NEXT_QUESTION = "NEXT_QUESTION",
    GO_TO_ANSWER = "GO_TO_ANSWER",
    GO_TO_FINAL_RESULTS = "GO_TO_FINAL_RESULTS",
    END = "END"
}

// export interface QuestionResults {
//     questionId: number;
//     questionCorrectBreakdown: QuestionCorrectBreakdown[];
//     averageAnswerTime: number;
//     percentCorrect: number;
// }

// export interface QuestionCorrectBreakdown {
//     answerId: number;
//     playersCorrect: string[];
// }

export type JwtToken = string;

export interface Quiz extends AdminQuizInfo {
    adminQuizId: number;
    imgUrl: string;
}

export interface QuizMetadata extends AdminQuizInfo {
    imgUrl: string;
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
    imgUrl?: string; // Make sure to put thumbnail in as actual parameter to whoever is doing it
}

export interface QuestionBody {
    question: string;
    duration: number;
    points: number;
    answers: Answer[];
    thumbnailUrl?: string;
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

export interface UpdateQuizToken {
    token: Jwt["token"];
    name: string;
}

export interface ErrorObj {
    error: string;
}

export interface OkObj {
    
}

export interface OkSessionObj {
    sessionId: number;
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
export type AdminupdateDetailsAuthHandlerReturn = AdminupdateDetailsAuthHandler| ErrorObj;
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

export interface AdminupdateDetailsAuthHandler {

}

export interface AdminUpdateUserPassword {

}

export interface AdminAuthLogout {

}

export interface QuizQuestionCreate {
    questionId: number;
}

export interface QuizTransfer {
    token: string;
    userEmail: string;
}

export interface AdminQuestionDuplicate {
    newQuestionId: number;
}

export interface QuizTrashReturn {
    quizzes: QuizTrashItemReturn[];
}
export interface QuizTrashItemReturn {
    quizId: number;
    name: string;
}

export interface PlayerReturn {
    playerId: number;
}

export interface PlayerQuestionInfoReturn {
    questionId: number,
    question: string,
    duration: number,
    thumbnailUrl: string,
    points: number,
    answers: QuestionAnswer[];
}

export interface QuestionAnswer {
    answerId: number,
    answer: string,
    colour: string
}
