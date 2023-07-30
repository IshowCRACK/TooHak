import { Data } from '../interfaces/interfaces';
// import fs from 'fs';
// import config from './config.json';

// const DATA_URL = config.dataUrl;

let data: Data = {
  users: [],
  quizzes: [],
  session: [],
  quizSessions: [],
  metaData: {
    totalUsers: 0,
    totalQuizzes: 0
  },
  maxPlayerId: 0,
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
  // load();
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
  // save();
}

// function save() {
//   fs.writeFileSync(DATA_URL, JSON.stringify(data));
// }

// function load() {
//   data = JSON.parse(String(fs.readFileSync(DATA_URL))) as Data;
// }

export { getData, setData };
