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
    if (!user) {
        return { error: 'AuthUserId is not a valid user' };
      }
  
    let quiz = null;
    for (let i = 0; i < store.quizes.length; i++) {
      if (store.quizes[i].quizId === quizId_target) {
        quiz = store.quizes[i];
        break;
      }
    }
    
    if (!quiz) {
        return { error: 'Quiz ID does not refer to a valid quiz' };
      }
      
    let userOwnsQuiz = false;
    for (let i = 0; i < store.quizes.length; i++) {
        if (store.quizes[i].quizId === quizId_target && store.quizes[i].adminQuizId === authUserId_target) {
            userOwnsQuiz = true;
            break;
        }
    }
    if (!userOwnsQuiz) {
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

function checkuserid(authUserId) {
    let data = getData();
    for (let user of data.users) {
        if (user.authUserId === authUserId) {
         return true;
        }
    }

    return false;
}

function checkquizname(authUserId, quizname) {
    let data = getData();
    const list = adminQuizList(authUserId);
    for (const quiz of list.quizzes) {
        if (quizname === quiz.name) {
         return true;
        }
    }
    return false;
}

function adminQuizCreate( authUserId, name, description ) {
    let data = getData();

    // check valid userID 
    if (checkuserid(authUserId) === false) {
        return { error: "User Does Not Exist"}
    }
    
    // check name length 
    if ((name === null)||(name === '')) {
        return { error: "A name must be entered"}
    }
        
    if ((name.length < 3)||(name.length > 30)) {
        return { error: "Name must be between 3 and 30 characters"};
    }
    
    // check name composition (alphanumeric)
    if (/^[a-zA-Z0-9\s]+$/.test(name) === false) {
        return {error: "Must use only alphanumeric characters or spaces in name"};
           
    }

    // check description length
    if (description.length > 100) {
       return { error: "Description must be under 100 characters"};
    }
    // check if quiz name already in use by this user 
    if (checkquizname(authUserId, name) === true) {
        return { error: 'Quiz name already in use'};
    }

   let maxID = 0;

   if(data.quizes.length !== 0) {
   for (let quiz of data.quizes) {
        if (quiz.quizId > maxID) {
            maxID = quiz.quizId;
    
        }
    }
    maxID = maxID+1;
    }
    

    data.quizes.push({
        quizId: maxID,
        adminQuizId: authUserId,
        name: name,
        timeCreated: Math.round(Date.now()/ 1000),
        timeLastEdited: Math.round(Date.now()/ 1000),
        description: description,
    });

    setData(data);

    return {
        quizId: maxID,
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
function adminQuizNameUpdate (authUserId_target, quizId_target, name_updated) {
    const store = getData();

    let user = null;
    for (let i = 0; i < store.users.length; i++) {
      if (store.users[i].authUserId === authUserId_target) {
        user = store.users[i];
        break;
      }
    }
    if (!user) {
        console.log('here')
        return { error: 'AuthUserId is not a valid user' };
      }
  
    let quiz = null;
    for (let i = 0; i < store.quizes.length; i++) {
      if (store.quizes[i].quizId === quizId_target) {
        quiz = store.quizes[i];
        break;
      }
    }

    if (!quiz) {
        return { error: 'Quiz ID does not refer to a valid quiz' };
    }
      
    let userOwnsQuiz = false;
    for (let i = 0; i < store.quizes.length; i++) {
        if (store.quizes[i].quizId === quizId_target && store.quizes[i].adminQuizId === authUserId_target) {
            userOwnsQuiz = true;
            break;
        }
    }
    if (!userOwnsQuiz) {
      return { error: 'Quiz ID does not refer to a quiz that this user owns' };
    }

    if (/^[a-zA-Z0-9\s]+$/.test(name_updated) === false) {
        return {error: 'Must use only alphanumeric characters or spaces in name'};
    }

    if (name_updated.length < 3 || name_updated.length > 30) {
        return { error: 'Name must be between 3 and 30 characters long!' };
    }
    
    let userSameQuizName = false;
    for (let i = 0; i < store.quizes.length; i++) {
        if (store.quizes[i].name === name_updated && store.quizes[i].adminQuizId === authUserId_target) {
            userSameQuizName = true;
            break;
        }
    }
    if (userSameQuizName === true) {
      return { error: 'You have already used this name' };
    }

    quiz.name = name_updated;
    setData(store);
    return {};
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

//Helper
//checkQuizID - checks if a quizID is the same as one that a user already owns
//param: quizID
//returns: boolean


export {adminQuizDescriptionUpdate, adminQuizRemove, adminQuizNameUpdate, adminQuizList, adminQuizCreate, adminQuizInfo};