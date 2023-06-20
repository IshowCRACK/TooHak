import {getData, setData} from './dataStore.js';

// implementation for the function adminQuizRemove given
// Parameters: userId, quizId, description and Return: empty object
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    
    return {

    }
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
        return false;
    }
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
        return { error: "must enter a name"}
    } else if ((name.length < 3)||(name.length > 30)) {
        return { error: "name must be between 3 and 30 characters"};
    }
    // check name composition (alphanumeric)
    if (/^[a-zA-Z0-9]+$/.test(name) === false) {
        return {error: "Must use only alphanumeric characters in name"};
    }
    // check description length
    if (description.length > 100) {
       return { error: "description must be under 100 characters"};
    }
    // check if quiz name already in use by this user 
    if (checkquizname(authUserId, name) === true) {
        return { error: 'quiz name already in use'};
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
    console.log(data.quizes)
    return {
        quizId: maxID,
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