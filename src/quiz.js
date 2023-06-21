import {getData, setData} from './dataStore.js';

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
        return false;
    }
}
function checkQuizId(quizId) {
    let data = getData();
    for (let quiz of data.quizes) {
        if (quiz.quizId === quizId) {
         return true;
        }
        return false;
    }
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
    
    setData();
    console.log(data);
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
  * @returns {quizzes: Array<{quizId: number, name: string}>} - an array of quizzes and its details
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
    
    return output
}

// stub function for quiz description update, using given return values
function adminQuizNameUpdate (authUserId, quizId, name) {
    return {
        
    }
}

// Get all of the relevant information about the current quiz.
function adminQuizInfo(authUserId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    }
}
    
export {adminQuizDescriptionUpdate, adminQuizRemove, adminQuizNameUpdate, adminQuizList, adminQuizCreate, adminQuizInfo};