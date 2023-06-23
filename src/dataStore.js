let data = {
  users: [],
  quizzes: []
};

/**
  * Getter function to retrieve the data store object
  *
  * @returns {{data: {
  *   users: Array<{
  *     authUserId: integer,
  *     nameFirst: string,
  *     nameLast: string,
  *     email: string,
  *     password: string,
  *     numSuccessLogins: integer,
  *     numFailedPasswordsSinceLastLogin: integer,
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
function getData () {
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
function setData (newData) {
  data = newData;
}

export { getData, setData };
