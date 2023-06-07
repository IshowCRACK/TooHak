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
// Parameters and Return object

function adminAuthRegister(email, password, nameFirst, nameLast) {

    return {
        authUserId: 1
    }
} 
// implementation for the cuntion authLogin given
// Parameters and Return Object
function adminAuthLogin(email, password ) {

    return {
        authUserId: 1
    }
}