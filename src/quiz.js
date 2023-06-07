function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    return {}
}

// implementation for the function adminQuizRemove given
// Parameters and Return Object
function adminQuizRemove(authUserId, quizId) {
        return {

        }
}

// implementation for the function adminQuizCreate given
// Parameters and Return Object

function adminQuizCreate(authUserId, name, description) {
        return {
                quizId: 2, 
        }
}
//implementation for the adminQuizLists function given
//parameters and return objects
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
    
    