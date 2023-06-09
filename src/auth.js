//implementation for the userdetails function given
// parameters: userId and 
// return object containing: userId, name, email, num of successful logins & num of failed password

function adminUserDetails(authUserId) {
    return {
        user:  {   
            userId: 1,    
            name: 'Hayden Smith',    
            email: 'hayden.smith@unsw.edu.au',    
            numSuccessfulLogins: 3,    
            numFailedPasswordsSinceLastLogin: 1,
        }
    } 
}  

// implementation for the function adminAuthRegister given
// Parameters: email, password, first name and last name and Return: userId
function adminAuthRegister(email, password, nameFirst, nameLast) {

    return {
        authUserId: 1
    }
} 

// implementation for the cuntion authLogin given
// Parameters: email and password and Return: UserId
function adminAuthLogin(email, password ) {

    return {
        authUserId: 1
    }
}