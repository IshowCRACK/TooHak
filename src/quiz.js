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
    quiz.timeLastEdited = Math.round(Date.now()/ 1000);
    setData(store);
    return {};
  }

/**
  * helper function to check if authUserId is valid
  * 
  * @param {number} authUserId - the specified authUserId
  * 
  * @returns {boolean} - returns true if authUserId is valid , otherwise, false
 */
function checkUserId(authUserId) {
	let data = getData();
	for (let user of data.users) {
		if (user.authUserId === authUserId) {
			return true;
		}
	}
  return false;
}

/**
  * helper function to check if quiz is valid
  * 
  * @param {number} quizId - the specified quizId
  * 
  * @returns {boolean} - returns true if quizId is valid , otherwise, false
 */

function checkQuizId(quizId) {
	let data = getData();
	for (let quiz of data.quizes) {
		if (quiz.quizId === quizId) {
			return true;
		}
	}
	return false;
}

/**
  *	helper function to check if quiz is owned by this user
  * 
 	* @param {number} authUserId - the user 
  * @param {number} quizId - the specified quizId
  * 
  * @returns {boolean} - returns true if quiz is owned by this user, otherwise, false
 */

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
/**
  *	Removes quiz object from data 
  * 
 	* @param {number} authUserId - the user 
  * @param {number} quizId - the specified quizId
  * 
  * @returns {object} - empty object 
 */

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
  for (let i = 0; i < length; i++) {
    if (data.quizes[i].quizId === quizId) {
      data.quizes.splice(i,1);
      break;
    }
  }
    
	setData(data);
	return {};
}
    

/**
  *	helper function to check if quiz name is already used in another quiz by the same user
  * 
 	* @param {number} authUserId - the user 
  * @param {number} quizname - the specified quiz name
  * 
  * @returns {boolean} - returns true if quizname is already used, otherwise, false
 */

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

/**
  *	Creates a new quiz object in the quizzes array 
  * 
 	* @param {number} authUserId - the user 
  * @param {string} name - the name of new quiz
	* @param {string} description - the description for the quiz

  * 
  * @returns {object} - returns an object containing the quizId
 */

function adminQuizCreate( authUserId, name, description ) {
	let data = getData();

	// check valid userID 
	if (checkUserId(authUserId) === false) {
		return { error: "User Does Not Exist"}
	}
	// check name length 
	if ((name === null)||(name === '')) {
		return { error: "A name must be entered"}
	}
	if ((name.length < 3)||(name.length > 30)) {
		return { error: "Name must be between 3 and 30 characters"};
	}
	// check name composition (alphanumeric and spaces)
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
    quiz.timeLastEdited = Math.round(Date.now()/ 1000);
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