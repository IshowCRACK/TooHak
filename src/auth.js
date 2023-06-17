import {getData, setData} from './dataStore.js';
import validator from 'validator';


// function looks at the characters used in first name/last name
function checkName(name) {
	
	return /^[a-zA-Z\s\-']+$/.test(name);
}
// function checks if it contains at least one number and letter
function checkPassword(password) {
	
	return /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);
}

// implementation for the function adminAuthRegister given
// Parameters: email, password, first name and last name and Return: userId
function adminAuthRegister(email, password, nameFirst, nameLast) {
	
	let data = getData();
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
	}); 
	setData(data);
	return {
		authUserId: userID,
	}
} 

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

// implementation for the cuntion authLogin given
// Parameters: email and password and Return: UserId
function adminAuthLogin( email, password ) {

	const data = getData();	
	for (const user of data.users) {
		if (user.email === email) {
			if (user.password === password) {
				//console.log(user);
				let total = user.numSuccessLogins;
				user.numSuccessLogins = total++;
				//user.numFailedPasswordsSinceLastLogin = 0;
				setData(data);
				console.log(user);
				return {
					authUserId: user.authUserId
				}			
			}

			let failed = user.numFailedPasswordsSinceLastLogin + 1;
			user.numFailedPasswordsSinceLastLogin = failed;
			//console.log(user);
			setData(data);	
		}		
	}

	return {
			error: 'Username or Password is not valid'
	}
}

export { adminAuthLogin, adminAuthRegister, adminUserDetails };