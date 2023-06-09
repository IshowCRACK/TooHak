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

function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2, 
    }
}
//implementation for the adminQuizLists function given
//parameters: userId and return and object containing: quizId and quiz name
function adminQuizList(authUserId) {

    return {
        quizzes: [    
            {      
                quizId: 1,      
                name: 'My Quiz',    
            }  
        ]
    }
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
    
    