import {getData, setData} from './dataStore.js';
import { checkAuthUserIdValid } from './helper.js';

// implementation for the function adminQuizRemove given
// Parameters: userId, quizId, description and Return: empty object
function adminQuizDescriptionUpdate(authUserId_target, quizId_target, description_updated) {
    const store = getData();
  
    let user = null;
    for (let i = 0; i < store.users.length; i++) {
      if (store.users[i].authUserId === authUserId_target) {
        user = store.users[i];
        break;
      }
    }
  
    let quiz = null;
    for (let i = 0; i < store.quizes.length; i++) {
      if (store.quizes[i].quizId === quizId_target) {
        quiz = store.quizes[i];
        break;
      }
    }
  
    if (!user) {
      return { error: 'AuthUserId is not a valid user' };
    }
  
    if (!quiz) {
      return { error: 'Quiz ID does not refer to a valid quiz' };
    }
  
    if (!user.createdQuizzes.includes(quizId_target)) {
      return { error: 'Quiz ID does not refer to a quiz that this user owns' };
    }
  
    if (description_updated.length > 100) {
      return { error: 'Description is more than 100 characters in length' };
    }
  
    quiz.description = description_updated;
  
    setData(store);
    return {};
  }

// implementation for the function adminQuizRemove given
// Parameters: userID and quizID and Return: empty object
function adminQuizRemove(authUserId, quizId) {
    
    return {

    }
}

// implementation for the function adminQuizCreate given
// Parameters: userId, name, description and Return: quizId

function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2, 
    }
}
/**
  * Provides a list of all quizzes that are owned by the currently logged in user
  * 
  * @param {number} authUserId - the id of the registered user you are trying to look at the quizzes of
  * 
  * @returns {{quizzes: Array<{quizId: number, name: string}>}} - an array of quizzes and its details
 */
function adminQuizList(authUserId) {
    let data = getData();

    const output = {
        quizzes: [

        ]
    };
    
    // check all quizzes to see if its creater matches authUserId
    for (const quiz of data.quizes) {
        if (quiz.adminQuizId === authUserId) {
            output.quizzes.push({
                quizId: quiz.quizId,
                name: quiz.name
            });
        }
    }
    
    return output;
}

// stub function for quiz description update, using given return values
function adminQuizNameUpdate (authUserId, quizId, name) {
    return {
        
    }
}

/**
  * Get all of the relevant information about the current quiz
  * 
  * @param {number} authUserId - the id of the registered user you are trying to look at the quizzes of
  * @param {number} quizId - the id of the quiz you are trying to trying to get information of
  * 
  * @returns {{quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}} - an array of quizzes and its details
 */
function adminQuizInfo(authUserId, quizId) {
    const data = getData();

    if (!checkAuthUserIdValid(authUserId)) {
        return {error: 'authUserId is not a valid user'};
    }

    if (!checkQuizIdValid(quizId)) {
        return {error: 'quiz ID does not refer to a valid quiz'};
    }

    if (!checkQuizAndUserIdValid(quizId, authUserId)) {
        return {error: 'quiz ID does not refer to a quiz that this user owns'};
    }

    // If no errors
    for (const quiz of data.quizes) {
        if (quiz.quizId === quizId) {
            return {
                quizId: quiz.quizId,
                name: quiz.name,
                timeCreated: quiz.timeCreated,
                timeLastEdited: quiz.timeLastEdited,
                description: quiz.description
            }
        }
    }

    // This block should not logically run
    return {
        error: ''
    }
}

// Helper functions specific to quiz functionality

/**
  * Check if the quizId is valid and exists
  * 
  * @param {number} quizId - the id you are checking is valid or not
  * 
  * @returns {boolean} - returns true if userId is valid, false otherwise
 */
function checkQuizIdValid(quizId) {
    const data = getData();

    for (const quiz of data.quizes) {
        if (quiz.quizId === quizId) {
            return true;
        }
    }

    return false;
}

/**
  * Check if the user owns the specified quiz
  * 
  * @param {number} quizId - the specified quiz
  * @param {number} authUserId - the user who you seeing whether or not created the quiz
  * 
  * @returns {boolean} - returns true if user owns quiz, false otherwise
 */
function checkQuizAndUserIdValid(quizId, authUserId) {
    const data = getData();
    for (const quiz of data.quizes) {
        if (quiz.quizId === quizId && quiz.adminQuizId === authUserId) {
            return true;
        }
    }

    return false;
}


export {adminQuizDescriptionUpdate, adminQuizRemove, adminQuizNameUpdate, adminQuizList, adminQuizCreate, adminQuizInfo};