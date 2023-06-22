import { adminAuthLogin, adminAuthRegister, adminUserDetails } from './auth.js';
import { clear } from './other.js'

beforeEach(() => {
	clear();
})

describe('authRegister Tests', () => {
	
	describe('1. Successful authID', () => {

		test('1. Check successful register with 1 register', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			let authUserId2 = adminAuthRegister('g1ood.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			let authUserId3 = adminAuthRegister('god.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			expect(authUserId3).toStrictEqual({authUserId: 2});
		});
	});
	describe('2. Unsuccessful Register - TESTING NAMES', () => {
		test('1. Check unsuccessful FirstName - null input', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','','Jones');
			expect(authUserId).toStrictEqual({error: 'first name has to be between 2 and 20 characters'});
		});
		test('2. Check unsuccessful FirstName - using wrong characters', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Johnny-B345one','Jones');
			expect(authUserId).toStrictEqual({error: 'First name can only contain upper/lower case letters, spaces, hyphens or apostrophes'});
		});
		test('3. Check unsuccessful FirstName - Wrong Size', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','J','Jones');
			expect(authUserId).toStrictEqual({error: 'first name has to be between 2 and 20 characters'});
		});
		test('4. Check unsuccessful FirstName - Wrong Size', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Jooooooooooooooooooooooooooonnnnnnnnyyyyyyy','Jones');
			expect(authUserId).toStrictEqual({error: 'first name has to be between 2 and 20 characters'});
		});
		test('5. Check unsuccessful LastName - null input', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','');
			expect(authUserId).toStrictEqual({error: 'Last name has to be between 2 and 20 characters'});
		});
		test('6. Check unsuccessful LastName - using wrong characters', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo124143\'nes');
			expect(authUserId).toStrictEqual({error: 'Last name can only contain upper/lower case letters, spaces, hyphens or apostrophes'});
		});
		test('7. Check unsuccessful LastName - Wrong Size', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','j');
			expect(authUserId).toStrictEqual({error: 'Last name has to be between 2 and 20 characters'});
		});
		test('8. Check unsuccessful LastName - Wrong Size', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','joooooooooooooooooooooooonnnnnnnnnneeeeeeeeeeessssss');
			expect(authUserId).toStrictEqual({error: 'Last name has to be between 2 and 20 characters'});
		});
	});

	describe('3. Unsuccessful Register - TESTING PASSWORD', () => {
		test('1. Check unsuccessful password - less then 8 characters', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Pas','Joh nny-Bone','Jo\'nes');
			expect(authUserId).toStrictEqual({error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'});		
		});
		test('2. Check unsuccessful password - does not contain 1 number and 1 letter', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','123456789','Joh nny-Bone','Jo\'nes');
			expect(authUserId).toStrictEqual({error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'});
		});
		test('3. Check unsuccessful password - does not contain 1 number and 1 letter', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','','Joh nny-Bone','Jo\'nes');
			expect(authUserId).toStrictEqual({error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'});
		});
		test('4. Check unsuccessful password - does not contain 1 number and 1 letter', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','pyassword','Joh nny-Bone','Jo\'nes');
			expect(authUserId).toStrictEqual({error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'});
		});

	});

	describe ('4. Unsuccessful Register - TESTING EMAIL', () => {
		test('1. Check unsuccessful email - email not valid', () => {
			let authUserId = adminAuthRegister('good.emailgmail.com','Password123','Joh nny-Bone','Jo\'nes');
			expect(authUserId).toStrictEqual({error: 'Email is not valid'});
		});
		test('2. Check unsuccessful email - email used already', () => {
			let authUserId1 = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			let authUserId2 = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			expect(authUserId2).toStrictEqual({error: 'Email already used'});
		});

	});
});

describe ('authLogin Test', () => {
	describe ('1. Successful Login', () => {
		test('1. 1 user login', () => {
			let authUserId = adminAuthRegister('goofy.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			let authUserId2 = adminAuthLogin('goofy.email@gmail.com','Password123');
			expect(authUserId).toStrictEqual(authUserId2);
		});
		test('2. multiple user login', () => {
			let authUserId1 = adminAuthRegister('good.ail@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			let authUserId2 = adminAuthRegister('gooemail@gmail.com','Password121233','Joh nny-Bone','Jo\'nes');
			let authUserId3 = adminAuthRegister('gdemail@gmail.com','Password112315g23','Joh nny-Bone','Jo\'nes');
			let authUserId4 = adminAuthRegister('gooil@gmail.com','Password12sdf3','Joh nny-Bone','Jo\'nes');
			let authUserId5 = adminAuthRegister('mail@gmail.com','Password12sdf3','Joh nny-Bone','Jo\'nes');
			let authUserId = adminAuthLogin('gdemail@gmail.com','Password112315g23');
			expect(authUserId).toStrictEqual(authUserId3);
		});
	});
	describe ('2. Unsuccessful Login', () => {
		test('1. user does not exist', () => {
			let authUserId1 = adminAuthRegister('good.ail@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			let authUserId2 = adminAuthRegister('gooemail@gmail.com','Password121233','Joh nny-Bone','Jo\'nes');
			let authUserId3 = adminAuthRegister('gd.email@gmail.com','Password112315g23','Joh nny-Bone','Jo\'nes');
			let authUserId4 = adminAuthRegister('gooil@gmail.com','Password12sdf3','Joh nny-Bone','Jo\'nes');
			let authUserId5 = adminAuthRegister('mail@gmail.com','Password12sdf3','Joh nny-Bone','Jo\'nes');
			let authUserId = adminAuthLogin('goyeama@gmail.com','Pasworadsa2d123');
			expect(authUserId).toStrictEqual({error: 'Username or Password is not valid'});
		});
		test('2. Wrong Email', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			let authUserId2 = adminAuthLogin('good.ema@gmail.com','Password123');
			expect(authUserId2).toStrictEqual({error: 'Username or Password is not valid'});
		});
		test('3. Wrong Password', () => {
			let authUserId1 = adminAuthRegister('good.ail@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			let authUserId2 = adminAuthRegister('gooemail@gmail.com','Password121233','Joh nny-Bone','Jones');
			let authUserId = adminAuthLogin('good.ail@gmail.com','Passw15g23');
			expect(authUserId).toStrictEqual({error: 'Username or Password is not valid'});
		});
	});
});

describe ('authAdminDetails Test', () => {
	
	describe ('1. Successful details', () => {
		test('1. 1 user who has logged in without fail, (register counts as 1 successful login)', () => {
			let authUserId = adminAuthRegister('goofy.email@gmail.com','Password123','Pop','Smoke');
			let login1 = adminAuthLogin('goofy.email@gmail.com','Password123');
			let userDetails = adminUserDetails(login1.authUserId);
			expect(userDetails).toMatchObject({
				user: {
					userId: 0,    
					name: `Pop Smoke`,    
					email: `goofy.email@gmail.com`,    
					numSuccessfulLogins: 2,    
					numFailedPasswordsSinceLastLogin: 0,
				}
			});
		});
		
		test('2. 1 user who has login with multiple fail', () => {
			let authUserId = adminAuthRegister('g1oofy.email@gmail.com','Password123','Pop','Smoke');
			let login1 = adminAuthLogin('g1oofy.email@gmail.com','Password12');
			let login2 = adminAuthLogin('g1oofy.email@gmail.com','Password12');
			let login3 = adminAuthLogin('g1oofy.email@gmail.com','Password12');
			let login4 = adminAuthLogin('g1oofy.email@gmail.com','Password123');
			let userDetails = adminUserDetails(login4.authUserId);
			expect(userDetails).toMatchObject({
				user: {
					userId: 0,    
					name: `Pop Smoke`,    
					email: `g1oofy.email@gmail.com`,    
					numSuccessfulLogins: 2,    
					numFailedPasswordsSinceLastLogin: 0,
				}
			});
		});
		test('3. multiple users created and and multiple user who has failed multiple times', () => {
			
			let authUserId1 = adminAuthRegister('good.ail@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
			let authUserId2 = adminAuthRegister('gooemail@gmail.com','Password121233','Joh nny-Bone','Jo\'nes');
			let authUserId3 = adminAuthRegister('gdemail@gmail.com','Password112315g23','Joh nny-Bone','Jo\'nes');

			let login1_user1 = adminAuthLogin('good.ail@gmail.com','Pas13ord123');
			let login2_user1 = adminAuthLogin('good.ail@gmail.com','Pas13ord123');
			let login3_user1 = adminAuthLogin('good.ail@gmail.com','Pas13ord123');
			let login4_user1 = adminAuthLogin('good.ail@gmail.com','Pas13ord123');
			let login5_user1 = adminAuthLogin('good.ail@gmail.com','Pas13ord123');
			let login6_user1 = adminAuthLogin('good.ail@gmail.com','Password123');
			let userDetails = adminUserDetails(login6_user1.authUserId);
			expect(userDetails).toMatchObject({
				user: {
					userId: 0,    
					name: `Joh nny-Bone Jo\'nes`,    
					email: `good.ail@gmail.com`,    
					numSuccessfulLogins: 2,    
					numFailedPasswordsSinceLastLogin: 0,
				}
			});
			let login1_user2 = adminAuthLogin('gooemail@gmail.com','Passsword121233');
			let login2_user2 = adminAuthLogin('gooemail@gmail.com','Passwosrd121233');
			let login3_user2 = adminAuthLogin('gooemail@gmail.com','Password121233');
			let userDetails2 = adminUserDetails(login3_user2.authUserId);
			expect(userDetails2).toMatchObject({
				user: {
					userId: 1,    
					name: `Joh nny-Bone Jo\'nes`,    
					email: `gooemail@gmail.com`,    
					numSuccessfulLogins: 2,    
					numFailedPasswordsSinceLastLogin: 0,
				}
			});
			let login1_user3 = adminAuthLogin('gdemail@gmail.com','Passwrd112315g23');
			let login2_user3 = adminAuthLogin('gdemail@gmail.com','Password112315g23');
			let login3_user3 = adminAuthLogin('gdemail@gmail.com','Password112315g23');
			let login4_user3 = adminAuthLogin('gdemail@gmail.com','Password112315g23');
			let userDetails3 = adminUserDetails(login2_user3.authUserId);
			expect(userDetails3).toMatchObject({
				user: {
					userId: 2,    
					name: `Joh nny-Bone Jo\'nes`,    
					email: `gdemail@gmail.com`,    
					numSuccessfulLogins: 4,    
					numFailedPasswordsSinceLastLogin: 0,
				}
			});
		});
		test('4. User successfully registers but unable to login', () => {
			let authUserId = adminAuthRegister('goo4email@gmail.com','Password121233','Joh nny-Bone','Jo\'nes');
			let login1_user1 = adminAuthLogin('goo4email@gmail.com','Passsword123');
			let login2_user1 = adminAuthLogin('goo4email@gmail.com','Passsword123');
			let login3_user1 = adminAuthLogin('goo4email@gmail.com','Passsword123');
			let login4_user1 = adminAuthLogin('goo4email@gmail.com','Passsword123');
			let userDetails = adminUserDetails(authUserId.authUserId);
			expect(userDetails).toMatchObject({
				user: {
					userId: 0,    
					name: `Joh nny-Bone Jo\'nes`,    
					email: `goo4email@gmail.com`,    
					numSuccessfulLogins: 1,    
					numFailedPasswordsSinceLastLogin: 4,
				}
			});
		});
	});
	describe ('2. Unsuccessful details', () => {
		test('1. user does not exists)', () => {
			let authUserId1 = adminAuthRegister('gdemail@gmail.com','Password112315g23','Joh nny-Bone','Jo\'nes');
			let authUserId2 = adminAuthRegister('gdemal@gmail.com','Password112315g23','Joh nny-Bone','Jo\'nes');
			expect(adminUserDetails(3)).toStrictEqual({ error: 'User does not exists'});		
		});
	});
});


