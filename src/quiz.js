
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
