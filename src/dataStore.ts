import { Data } from '../interfaces/interfaces';

let data: Data = {
  users: [],
  quizzes: [],
  session: [],
  metaData: {
    totalUsers: 0,
    totalQuizzes: 0
  }
};

/**
  * Getter function to retrieve the data store object
  *
  * @returns {{data: {
  *   users: Array<{
  *     authUserId: number,
  *     nameFirst: string,
  *     nameLast: string,
  *     email: string,
  *     password: string,
  *     numSuccessLogins: number,
  *     numFailedPasswordsSinceLastLogin: number,
  *     deletedQuizzes: Array
  *   }>,
  *   quizzes: Array<{
  *     quizId: number,
  *     adminQuizId: number,
  *     name: string,
  *     timeCreated: number,
  *     description: string
  *   }>
  * }}}
*/
function getData (): Data {
  return data;
}

/**
  * Setter function to retrieve the data store object
  *
  * @param {{data: {
  *   users: Array<{
  *     authUserId: integer,
  *     nameFirst: string,
  *     nameLast: string,
  *     email: string,
  *     password: string,
  *     numSuccessLogins: integer,
  *     numFailedPasswordsSinceLastLogin: integer,
  *     deletedQuizzes: Array
  *   }>,
  *   quizzes: Array<{
  *     quizId: number,
  *     adminQuizId: number,
  *     name: string,
  *     timeCreated: number,
  *     description: string
  *   }>
  * }}} newData
*/
function setData (newData: Data): void {
  data = newData;
}

export { getData, setData };
