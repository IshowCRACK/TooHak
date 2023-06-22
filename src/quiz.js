import {getData, setData} from './dataStore.js';
import { checkAuthUserIdValid } from './helper.js';


/**
  * Update the description of the relevant quiz
  * 
  * @param {number} authUserId - A unique Id for the user who owns the quiz
  * @param {number} quizId - A unique Id for the specified quiz
  * @param {string} description - Quiz description
  * 
  * @returns {{} | {error: string}} - Returns an empty object if valid
 */
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
  *	Given a particular quiz, permanently remove the quiz
  * 
 	* @param {number} authUserId - A unique Id for the user who owns the quiz
  * @param {number} quizId - A unique Id for the specified quiz
  * 
  * @returns {{} | {error: string}} - Returns empty object if valid 
 */
function adminQuizRemove(authUserId, quizId) {
	let data = getData();
	console.log(data);
    //AuthUserId is not a valid user
	if (checkAuthUserId(authUserId) === false) {
		return { error: "User Does Not Exist"}
	}
	//Quiz ID does not refer to a valid quiz
	if (checkQuizIdValid(quizId) === false) {
		return { error:  'Invalid QuizId'}
	}
	//Quiz ID does not refer to a quiz that this user owns
	if (checkQuizAndUserIdValid(quizId, authUserId) === false) {
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
  *	Given basic details about a new quiz, create one for the logged in user
  * 
 	* @param {number} authUserId -  The unique Id for the user who is creating the quiz
  * @param {string} name - The name of new quiz
	* @param {string} description - The description for the new quiz

  * 
  * @returns {{quizId: number} | {error: string}} - Returns an object containing the quizId
 */
function adminQuizCreate( authUserId, name, description ) {
	let data = getData();

	// check valid userID 
	if (checkAuthUserId(authUserId) === false) {
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
	if (checkQuizNameUsed(authUserId, name) === true) {
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
  * @param {number} authUserId - The unique Id for the user who owns the quiz
  * 
  * @returns {{quizzes: Array<{quizId: number, name: string}>}} - An array of quizzes and its details
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

/**
  * Update the name of the relevant quiz
  * 
  * @param {number} authUserId - The unique Id for the user who owns the quiz
  * @param {number} quizId - The unique Id for the specified quiz
  * @param {string} name - The name that you want to change the quizzes name into
  * 
  * @returns {{} | {error: string}} - Returns an empty object if valid
 */
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
  * @param {number} authUserId - The unique id of the registered user you are trying to look at the quizzes of
  * @param {number} quizId - The unique id of the quiz you are trying to trying to get information of
  * 
  * @returns {{quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}} - An array of quizzes and its details
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

/**
 * -------------------------------------- HELPERS FUNCTIONS-----------------------------------------------
 */

/**
  * Check if the quizId is valid and exists
  * 
  * @param {number} quizId - The id you are checking is valid or not
  * 
  * @returns {boolean} - Returns true if userId is valid, false otherwise
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
  *  Check if authUserId is valid and exists
  * 
  * @param {number} authUserId - The specified authUserId
  * 
  * @returns {boolean} - Returns true if authUserId is valid , otherwise, false
 */
function checkAuthUserId(authUserId) {
	let data = getData();
	for (let user of data.users) {
		if (user.authUserId === authUserId) {
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
function checkQuizAndUserIdValid(quizId, authUserId) {
    const data = getData();
    for (const quiz of data.quizes) {
        if (quiz.quizId === quizId && quiz.adminQuizId === authUserId) {
            return true;
        }
    }

    return false;
}

/**
  *	Check if quiz name is already used in another quiz by the same user
  * 
 	* @param {number} authUserId - A unique Id for the user who owns the quiz 
  * @param {number} quizName - The specified quiz name
  * 
  * @returns {boolean} - Returns true if quizname is already used, otherwise, false
 */
   function checkQuizNameUsed(authUserId, quizName) {
    let data = getData();
    const list = adminQuizList(authUserId);
    for (const quiz of list.quizzes) {
      if (quizName === quiz.name) {
        return true;
      }
    }
    return false;
  }

export {adminQuizDescriptionUpdate, adminQuizRemove, adminQuizNameUpdate, adminQuizList, adminQuizCreate, adminQuizInfo};