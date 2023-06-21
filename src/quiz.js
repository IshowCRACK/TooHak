import {getData, setData} from './dataStore.js';
import { checkAuthUserIdValid } from './helper.js';

// implementation for the function adminQuizRemove given
// Parameters: userId, quizId, description and Return: empty object
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    
    return {

    }
}

// implementation for the function adminQuizRemove given
// Parameters: userID and quizID and Return: empty object

function checkUserId(authUserId) {
    let data = getData();
    for (let user of data.users) {
        if (user.authUserId === authUserId) {
         return true;
        }
    }
    return false;
}
function checkQuizId(quizId) {
    let data = getData();
    for (let quiz of data.quizes) {
        if (quiz.quizId === quizId) {
         return true;
        }
    }
    return false;
}

function checkQuizIdOwnership(authUserId, quizId) {
    let data = getData();
    const list = adminQuizList(authUserId);
    for (const quiz of list.quizzes) {
        if (quizId === quiz.quizId) {
         return true;
        }
    }
    return false;
}

function adminQuizRemove(authUserId, quizId) {
    let data = getData();
    console.log(data);
    //AuthUserId is not a valid user
        if (checkUserId(authUserId) === false) {
            return { error: "User Does Not Exist"}
        }
    //Quiz ID does not refer to a valid quiz
    if (checkQuizId(quizId) === false) {
        return { error:  'Invalid QuizId'}
    }
    //Quiz ID does not refer to a quiz that this user owns
    if (checkQuizIdOwnership(authUserId, quizId) === false) {
        return { error: 'Quiz ID does not refer to a quiz that this user own'};
    }

    const length = data.quizes.length
    for (let i=0; i < length; i++) {
        if (data.quizes[i].quizId === quizId) {
            data.quizes.splice(i,1);
            break;
        }
    }
    
    setData(data);
    console.log(data);

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