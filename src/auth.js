
import { getData, setData } from './dataStore.js';
import validator from 'validator';

/**
  * function looks at the characters used in first name/last name
  * 
  * @param {string} name - string that contains letters, spaces, hyphens or apostrophes
	* 
  * @returns {boolean} - returns true or false if first name or last name satisfies the conditions
  * 
*/
function checkName(name) {
	
	return /^[a-zA-Z\s\-']+$/.test(name);
}
/**
  * function checks if password contains at least one number and letter
  * 
  * @param {string} password - string that contains atleast 1 number and 1 letter and is 8 characters long
	* 
  * @returns {boolean} - returns true or false if password satisfies the conditions
  * 
*/
function checkPassword(password) {
	
	return /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);
}


/**
  * Function takes in given parameters and creates a new user that has a unique ID
	* The input is stored in dataStore under users array
  * 
  * @param {string} email - it is a string that user inputs to create a unique account
  * @param {string} password - string that contains atleast 1 number and 1 letter and is 8 characters long
  * @param {string} nameFirst - Users first name
  * @param {string} nameLast - Users last name
	* 
  * @returns {number} - returns an integer, authUserId that is unique to the user
  * 
*/
function adminAuthRegister(email, password, nameFirst, nameLast) {
	
	let data = getData();
	
	// checking if any parts are null
	if (email === null || password === null || nameFirst === null || nameLast === null) {
		return {
			error: 'All sections should be filled'
		}
	}
	// checking email hasnt been used
	for (const user of data.users) {
		if (user.email === email) {
			return {
				error: 'Email already used'
			}
		}
	}
	// check email is valid using validator
	if (!validator.isEmail(email)) {
		return {
			error: 'Email is not valid'
		}
	}
	// checking first name
	if (nameFirst.length > 20 || nameFirst.length < 2) {
		return {
			error: 'first name has to be between 2 and 20 characters'
		}
	} else if (!checkName(nameFirst)) {
		return {
			error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes'
		}
	}
	// checking last name
	if (nameLast.length > 20 || nameLast.length < 2) {
		return {
			error: 'Last name has to be between 2 and 20 characters'
		}
	} else if (!checkName(nameLast)) {
		return {
			error: 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes'
		}
	} 
	//checking password
	if (password.length < 8 || !checkPassword(password)) {
		return {
			error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'
		}
	} 
	// else if every parameter is valid push into users database
	const userID = data.users.length;
	data.users.push ({
		email: email,
		password: password,
		firstName: nameFirst,
		lastName: nameLast,
		authUserId: userID,
		numSuccessLogins: 1,
		numFailedPasswordsSinceLastLogin: 0,
		failNow: 0,
	});
	
	setData(data);
	
	return {
		authUserId: userID,
	}
} 

/**
  * Function takes the UserId and returns the users details
	* If UserId is invalid it returns an error
  * 
  * @param {number} authUserId - integer that is unique to 1 user and helps to identify them
	* 
  * @returns {user} - returns an an object of User's details
  * 
*/
function adminUserDetails(authUserId) {

	const data = getData();		
	
	// Loop through users dataStore
	for (const user of data.users) {
		
		// if ID matched return the users ID
		if (user.authUserId === authUserId) {
			return {
				user: {
					userId: user.authUserId,    
					name: `${user.firstName} ${user.lastName}`,    
					email: user.email,    
					numSuccessfulLogins: user.numSuccessLogins,    
					numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
				}
			}
		}
	}
	return {
		error: 'User does not exists'
	}
}

/**
  * Function looks through users dataStore and check if the email and password have been registered
	* If user hasn't return error
  * 
  * @param {string} email - string that user inputs to create a unique account
  * @param {string} password - string that contains atleast 1 number and 1 letter and is 8 characters long
	* 
  * @returns {number} - returns an integer, authUserId that is unique to the user
  * 
*/
function adminAuthLogin( email, password ) {
	
	const data = getData();	
	
	// loop through users array from dataStore
	for (const user of data.users) {	
		if (user.email === email) {								
			if (user.password === password) {
				
				// add successful logins for all times
				let total = user.numSuccessLogins + 1;
				user.numSuccessLogins = total;
				
				// If user messed up in log in prior to successful login
				if (user.failNow > 0) {	
					user.numFailedPasswordsSinceLastLogin = user.failNow;
					user.failNow = 0;
				
					// User didnt fail to login this instance
				} else if (user.failNow === 0) {
					user.numFailedPasswordsSinceLastLogin = 0;
				}
				setData(data);
				return {
					authUserId: user.authUserId
				}			
			}
			// Add on to how many times user has failed before a successful login 
			else {				
				user.failNow = user.failNow + 1;
				setData(data);
			}
		}		
	}
	return {
			error: 'Username or Password is not valid'
	}
}

export { adminAuthLogin, adminAuthRegister, adminUserDetails };