import { AdminQuizList, Token, Jwt, Quiz, Answer, Question, User, States, Actions, QuestionCorrectBreakdown, PlayerAnswer, QuizSessionAdmin, UserScore, QuestionDetailsHelper, QuestionResult } from '../interfaces/interfaces';
import { getData } from './dataStore';
import { adminQuizList } from './quiz';
import { checkJwtValid, jwtToToken } from './token';
import crypto from 'crypto';
import randomstring from 'randomstring';

/**
 * -------------------------------------- HELPERS FUNCTIONS-----------------------------------------------
 */

/**
  * Function looks at the characters used in first name/last name
  *
  * @param {string} name - String that contains letters, spaces, hyphens or apostrophes
  *
  * @returns {boolean} - Returns true or false if first name or last name satisfies the conditions
*/
export function checkName (name: string): boolean {
  return /^[a-zA-Z\s\-']+$/.test(name);
}

/**
  * Function checks if password contains at least one number and letter
  *
  * @param {string} password - String that contains atleast 1 number and 1 letter and is 8 characters long
  *
  * @returns {boolean} - Returns true or false if password satisfies the conditions
*/
export function checkPassword (password: string): boolean {
  return /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password) && password.length > 8;
}

/**
  * Check if the name is only made up of alphanumbers and spaces
  *
  * @param {string} name - The name u are checking
  *
  * @returns {boolean} - Returns false if not made up of alphanumbers and spaces, else true
 */

export function checkAlphanumeric(name: string): boolean {
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    return false;
  }

  return true;
}

/**
  * Check if the quizId is valid and exists
  *
  * @param {number} quizId - The id you are checking is valid or not
  *
  * @returns {boolean} - Returns true if userId is valid, false otherwise
 */
export function checkQuizIdValid (quizId: number): boolean {
  const data = getData();

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      return true;
    }
  }

  return false;
}

/**
  * Check if the user owns the specified quiz
  *
  * @param {number} quizId - The specified quiz
  * @param {number} authUserId - The user who you seeing whether or not created the quiz
  *
  * @returns {boolean} - Returns true if user owns quiz, false otherwise
 */
export function checkQuizAndUserIdValid (quizId: number, authUserId: number): boolean {
  const data = getData();

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId && quiz.adminQuizId === authUserId) {
      return true;
    }
  }

  return false;
}

/**
  * Check if quiz name is already used in another quiz by the same user
  *
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  * @param {string} quizName - The specified quiz name
  *
  * @returns {boolean} - Returns true if quizname is already used, otherwise, false
 */
export function checkQuizNameUsed (jwt: Jwt, quizName: string): boolean {
  const list = adminQuizList(jwt) as AdminQuizList;

  for (const quiz of list.quizzes) {
    if (quizName === quiz.name) {
      return true;
    }
  }

  return false;
}

/**
 * Check if email is already used in another User
 *
 * @param {string} email - User's email
 * @param {number} authUserId - User's unique ID
 *
 * @returns {boolean} - Returns true if email is already used, otherwise false
 */
export function emailAlreadyUsed(email: string, authUserId: number): boolean {
  const data = getData();

  for (const user of data.users) {
    if (user.email === email && user.authUserId !== authUserId) {
      return true;
    }
  }

  return false;
}

/**
 * Checks for error: 401 Token is not a valid structure
 * @param {Jwt} jwt - token unique id
 *
 * @returns {boolean} - Returns true if Token valid, otherwise false
 */
export function checkTokenValidStructure(jwt: Jwt): boolean {
  // check valid structure
  const possibleToken = checkJwtValid(jwt);

  if (possibleToken.valid === false) {
    return false;
  }
  return true;
}

/**
 * Checks for these error: 403 Provided token is valid structure, but is not for a currently logged in session
 * @param {Jwt} jwt - token unique id
 *
 * @returns {boolean} - Returns true if Token valid, otherwise false
 */
export function checkTokenValidSession(jwt: Jwt): boolean {
  const data = getData();
  //  check if valid for active sessions
  if ((data.session.find((token: Token) => token.userId === jwtToToken(jwt).userId)) === undefined) {
    return false;
  }
  return true;
}


export function getTotalDuration(quiz: Quiz): number {
  let totalDuration = 0;
  for (const question of quiz.questions) {
    totalDuration += question.duration;
  }

  return totalDuration;
}

export function checkAnswerLengthValid(answers: Answer[]): boolean {
  return !(answers.some((answer: Answer) => answer.answer.length < 1 || answer.answer.length > 30));
}

export function checkQuestionAnswerNonDuplicate(answers: Answer[]): boolean {
  const encounteredAnswers = new Set();

  for (const answerObj of answers) {
    const answer = answerObj.answer;

    if (encounteredAnswers.has(answer)) return false;

    encounteredAnswers.add(answer);
  }

  return true;
}

export function checkAnswerHasTrueValue(answers: Answer[]): boolean {
  return (answers.some((answer: Answer) => answer.correct === true));
}

// export function createQuestionId(quiz: Quiz): number {
//   let questionId = -1;
//   // TODO: change this
//   for (const question of quiz.questions) {
//     if (question.questionId > questionId) questionId = question.questionId;
//   }

//   ++questionId;

//   return questionId;
// }

export function createQuestionId(quiz: Quiz): number {
  let maxQuestionId = -1;

  for (const question of quiz.questions) {
    if (question.questionId > maxQuestionId) {
      maxQuestionId = question.questionId;
    }
  }

  const newQuestionId = maxQuestionId + 1;

  return newQuestionId;
}

export function createQuizId(): number {
  const data = getData();

  const quizId: number = data.metaData.totalQuizzes;

  return quizId;
}

export function createUserId(): number {
  const data = getData();

  const userId: number = data.metaData.totalUsers;

  return userId;
}

export function checkQuestionIdValid(questionId: number, quiz: Quiz): boolean {
  for (const question of quiz.questions) {
    if (question.questionId === questionId) {
      return true;
    }
  }
  return false;
}

export function checkNameUsedInQuiz(quizId: number, userId: number): boolean {
  const data = getData();

  const curQuiz: Quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);

  for (const quiz of data.quizzes) {
    if (quiz.quizId !== quizId && quiz.adminQuizId === userId && quiz.name === curQuiz.name) return true;
  }

  return false;
}

export function checkQuestionIdIsValidInQuiz(questions: Question[], questionId: number): boolean {
  const foundQuestion = questions.find((question) => question.questionId === questionId);
  return !!foundQuestion; // Convert the foundQuestion to a boolean value
}

export function checkQuizIdValidAndTrash(quizId: number): boolean {
  const data = getData();

  if (checkQuizIdValid(quizId)) return true;

  for (const user of data.users) {
    if (user.deletedQuizzes.find((quiz: Quiz) => quiz.quizId === quizId) !== undefined) return true;
  }

  return false;
}

export function checkQuizIdAndUserIdValidAndTrash(quizId: number, userId: number): boolean {
  if (checkQuizAndUserIdValid(quizId, userId)) return true;

  const data = getData();

  const user = data.users.find((user: User) => user.authUserId === userId);

  if (user.deletedQuizzes.find((quiz: Quiz) => quiz.quizId === quizId) !== undefined) return true;

  return false;
}

// Checks if there is a maximum of 10 sessions not in end state
export function checkMaxNumSessions(userId: number): boolean {
  const data = getData();

  let numActiveSessions = 0;
  for (const quizSession of data.quizSessions) {
    if (quizSession.state !== States.END && quizSession.authUserId === userId) {
      numActiveSessions++;
    }
  }
  return numActiveSessions <= 10;
}

// Checks if there is at least 1 question in the quiz
export function checkQuizHasQuestions(quizId: number): boolean {
  const data = getData();

  const quiz: Quiz = data.quizzes.find((quiz: Quiz) => quiz.quizId === quizId);

  // Returns false if there is no questions
  if (quiz.questions.length === 0) return false;

  return true;
}

/**
  * Hashes the passwords
  *
  * @param {string} password - Uniqued hashed password
  *
  * @returns {string} - Returns string for the hashed password
 */

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Function to check if a given action exists in the Actions enum
export function isActionValid(action: string): boolean {
  // Get all the enum values of Actions as an array
  const allActions: string[] = Object.values(Actions);

  // Check if the action exists in the array of allActions
  return allActions.includes(action);
}

export function getLetter() {
  const letters: string[] = [];

  while (letters.length !== 5) {
    const letter = randomstring.generate({
      length: 1,
      charset: 'alphabetic'
    });

    if (!letters.includes(letter)) {
      letters.push(letter);
    }
  }

  return letters.join('');
}

export function getNumber() {
  const numbers: number[] = [];

  while (numbers.length !== 3) {
    const number = randomstring.generate({
      length: 1,
      charset: 'numeric'
    });

    if (!numbers.includes(parseInt(number))) {
      numbers.push(parseInt(number));
    }
  }

  return numbers.join('');
}

// checks of duplicates in an array
export function hasDuplicates(answerIds: number[]): boolean {
  const numberSet: Set<number> = new Set();

  for (const answer of answerIds) {
    if (numberSet.has(answer)) {
      return true; // Found a duplicate
    }
    numberSet.add(answer); // Add the number to the Set
  }

  return false; // No duplicates found
}

export function isAnswersCorrect(correctAnswerIds: number[], answerIds: number[]): boolean {
  // Check if both arrays have the same length
  if (correctAnswerIds.length !== answerIds.length) {
    return false;
  }

  // Create sets from the arrays to remove duplicate elements and order dependency
  const set1 = new Set(correctAnswerIds);
  const set2 = new Set(answerIds);

  // Check if the sets are equal
  const isEqual = JSON.stringify(Array.from(set1).sort()) === JSON.stringify(Array.from(set2).sort());

  return isEqual;
}

export function getQuestionCorrectBreakdown(
  playerAnswers: PlayerAnswer[],
  questionId: number,
  correctAnswerIds: number[]
): QuestionCorrectBreakdown[] {
  // Filter correct answers for the specified questionId and those that are actually correct
  const correctAnswers: PlayerAnswer[] = playerAnswers.filter(
    (answer) => answer.questionId === questionId && answer.isCorrect
  );

  // Create an object to store the players who chose each correct option
  const groupedCorrectAnswers: { [answerId: number]: string[] } = {};

  for (const answer of correctAnswers) {
    // Ensure that answerIds is an array before iterating over it
    if (!Array.isArray(answer.answerIds)) {
      continue; // Skip this iteration if answerIds is not an array
    }

    for (const answerId of answer.answerIds) {
      if (groupedCorrectAnswers[answerId]) {
        groupedCorrectAnswers[answerId].push(answer.name);
      } else {
        groupedCorrectAnswers[answerId] = [answer.name];
      }
    }
  }

  // Create the final QuestionCorrectBreakdown array based on correctAnswerIds
  const questionCorrectBreakdown: QuestionCorrectBreakdown[] = correctAnswerIds.map((answerId) => ({
    answerId,
    playersCorrect: groupedCorrectAnswers[answerId] || [], // Set to an empty array if no players chose this correct answer
  }));

  return questionCorrectBreakdown;
}

export function questionAverageAnswerTime(playerAnswers: PlayerAnswer[], questionId: number): number {
  const answersForQuestion = playerAnswers.filter((answer) => answer.questionId === questionId);

  if (answersForQuestion.length === 0) {
    return 0; // No answers for the question, return 0 as the average time
  }

  const totalAnswerTime = answersForQuestion.reduce((sum, answer) => sum + answer.submissionTime, 0);
  const averageTime = totalAnswerTime / answersForQuestion.length;

  return averageTime;
}

export function questionPercentageCorrect(playerAnswers: PlayerAnswer[], questionId: number): number {
  const answersForQuestion = playerAnswers.filter((answer) => answer.questionId === questionId);

  if (answersForQuestion.length === 0) {
    return 0; // No answers for the question, return 0 as the percentage correct
  }

  const totalSubmissions = answersForQuestion.length;
  const correctSubmissions = answersForQuestion.filter((answer) => answer.isCorrect).length;

  const percentageCorrect = (correctSubmissions / totalSubmissions) * 100;

  return percentageCorrect;
}

export function convertStringToArray(s: string): string[] {
  if (s.length === 2) return [];

  s = s.substring(1, s.length - 1);
  const sArr: string[] = s.split(',');
  return sArr;
}

export function rankUserByScore(session: QuizSessionAdmin): UserScore[] {
  const playerScoreMap = new Map<string, number>();
  const questionDetailMap = new Map<number, QuestionDetailsHelper>();

  for (const playerName of session.players) {
    playerScoreMap.set(playerName, 0);
  }

  for (const question of session.metadata.questions) {
    const answerId = [];
    for (const answer of question.answers) {
      if (answer.correct) answerId.push(answer.answerId);
    }

    questionDetailMap.set(question.questionId, {
      numAnswered: 1,
      correctAnswers: answerId,
      points: question.points
    });
  }


  for (const ans of session.playerAnswers) {
    // If the players answers is same as what is expected

    const questionDetails = questionDetailMap.get(ans.questionId);
  

    if (compareArray(questionDetails.correctAnswers, ans.answerIds)) {
      playerScoreMap.set(
        ans.name,
        playerScoreMap.get(ans.name) + Number((questionDetails.points / questionDetails.numAnswered).toFixed(1))
      );
      // number of people answered increases by 1 to deduct score
      questionDetails.numAnswered++;
      questionDetailMap.set(ans.questionId, questionDetails);
    }
  }

  // Sort by score

  const entries = Array.from(playerScoreMap.entries());

  entries.sort((a, b) => b[1] - a[1]);

  const sortedArray: UserScore[] = entries.map(entry => {
    const [key, value] = entry;
    return {
      name: key,
      score: value
    };
  });


  return sortedArray;
}

export function compareArray(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) return false;

  arr1 = arr1.sort();
  arr2 = arr2.sort();

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

export function getQuestionResultsHelper(session: QuizSessionAdmin): QuestionResult[] {
  const questionResultMap = new Map<number, QuestionResult>();
  const questionDetailMap = new Map<number, QuestionDetailsHelper>();

  for (const question of session.metadata.questions) {
    const answerId = [];
    for (const answer of question.answers) {
      if (answer.correct) answerId.push(answer.answerId);
    }

    questionDetailMap.set(question.questionId, {
      numAnswered: 1,
      correctAnswers: answerId,
      points: question.points
    });
  }

  for (const question of session.metadata.questions) {
    const answer = questionDetailMap.get(question.questionId);
    const questionCorrectBreakdown: QuestionCorrectBreakdown[] = [];
    for (const answerId of answer.correctAnswers) {
      const questionCorrectBreakdownItem: QuestionCorrectBreakdown = {
        answerId: answerId,
        playersCorrect: []
      };

      questionCorrectBreakdown.push(questionCorrectBreakdownItem);
    }

    questionResultMap.set(question.questionId, {
      questionId: question.questionId,
      questionCorrectBreakdown: questionCorrectBreakdown,
      averageAnswerTime: 0,
      percentCorrect: 0
    });
  }

  // Going through each player answer and adding it into results
  for (const ans of session.playerAnswers) {
    const questionResults = questionResultMap.get(ans.questionId);

    const questionDetails = questionDetailMap.get(ans.questionId);

    if (compareArray(ans.answerIds, questionDetails.correctAnswers)) {
      questionResults.percentCorrect++;
    }

    questionResults.averageAnswerTime += ans.submissionTime;

    for (const answerId of ans.answerIds) {
      // if one of the answers player submitted is correct
      if (questionDetails.correctAnswers.indexOf(answerId) !== -1) {
        const questionCorrect: QuestionCorrectBreakdown = questionResults.questionCorrectBreakdown.find((item: QuestionCorrectBreakdown) => item.answerId === answerId);
        questionCorrect.playersCorrect.push(ans.name);
      }
    }

    // questionResultMap.set(ans.questionId, questionResults);
  }

  const numPlayers: number = session.playerInfo.length;

  const output: QuestionResult[] = [];

  for (const question of session.metadata.questions) {
    const questionId = question.questionId;
    const questionResults = questionResultMap.get(questionId);

    questionResults.averageAnswerTime = Math.round(questionResults.averageAnswerTime) / numPlayers;
    questionResults.percentCorrect = Math.round(questionResults.percentCorrect / numPlayers * 100);

    // questionResultMap.set(questionId, questionResults);
    output.push(questionResults);
  }

  return output;
}

export function checkAllQuizzesInEndState(quizId: number) {
  const data = getData();

 
  for (let session of data.quizSessions) {
    if (session.metadata.quizId == quizId && session.state != States.END) return false;
  }

  return true;
}