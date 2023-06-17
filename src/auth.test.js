import { adminAuthLogin, adminAuthRegister, adminUserDetails } from './auth.js';
import { clear } from './other.js'

beforeEach(() => {
	clear();
})

describe('authRegister tests', () => {
	
	describe('1. Successful authID', () => {

		test('1. Check successful register with 1 register', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
			expect(authUserId).toStrictEqual({authUserId: 1});
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
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone',"Jo124143'nes");
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
			let authUserId = adminAuthRegister('good.email@gmail.com','Pas','Joh nny-Bone',"Jo'nes");
			expect(authUserId).toStrictEqual({error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'});		
		});
		test('2. Check unsuccessful password - does not contain 1 number and 1 letter', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','123456789','Joh nny-Bone',"Jo'nes");
			expect(authUserId).toStrictEqual({error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'});
		});
		test('3. Check unsuccessful password - does not contain 1 number and 1 letter', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','','Joh nny-Bone',"Jo'nes");
			expect(authUserId).toStrictEqual({error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'});
		});
		test('4. Check unsuccessful password - does not contain 1 number and 1 letter', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','pyassword','Joh nny-Bone',"Jo'nes");
			expect(authUserId).toStrictEqual({error: 'Password length has to be 8 characters & needs to contain at least one number and at least one letter'});
		});

	});

	describe ('4. Unsuccessful Register - TESTING EMAIL', () => {
		test('1. Check unsuccessful email - email not valid', () => {
			let authUserId = adminAuthRegister('good.emailgmail.com','Password123','Joh nny-Bone',"Jo'nes");
			expect(authUserId).toStrictEqual({error: 'Email is not valid'});
		});
		test('2. Check unsuccessful email - email used already', () => {
			let authUserId1 = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
			let authUserId2 = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
			expect(authUserId2).toStrictEqual({error: 'Email already used'});
		});

	});
});

describe ('authLogin Test', () => {
	describe ('Successful Login', () => {
		test('1. 1 user login', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
			let authUserId2 = adminAuthLogin('good.email@gmail.com','Password123');
			expect(authUserId).toStrictEqual(authUserId2);
		});
		test('2. multiple user login', () => {
			let authUserId1 = adminAuthRegister('good.ail@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
			let authUserId2 = adminAuthRegister('gooemail@gmail.com','Password121233','Joh nny-Bone',"Jo'nes");
			let authUserId3 = adminAuthRegister('gdemail@gmail.com','Password112315g23','Joh nny-Bone',"Jo'nes");
			let authUserId4 = adminAuthRegister('gooil@gmail.com','Password12sdf3','Joh nny-Bone',"Jo'nes");
			let authUserId5 = adminAuthRegister('mail@gmail.com','Password12sdf3','Joh nny-Bone',"Jo'nes");
			let authUserId = adminAuthLogin('gdemail@gmail.com','Password112315g23');
			expect(authUserId).toStrictEqual(authUserId3);
		});
	});
	describe ('Unsuccessful Login', () => {
		test('1. user does not exist', () => {
			let authUserId1 = adminAuthRegister('good.ail@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
			let authUserId2 = adminAuthRegister('gooemail@gmail.com','Password121233','Joh nny-Bone',"Jo'nes");
			let authUserId3 = adminAuthRegister('gd.email@gmail.com','Password112315g23','Joh nny-Bone',"Jo'nes");
			let authUserId4 = adminAuthRegister('gooil@gmail.com','Password12sdf3','Joh nny-Bone',"Jo'nes");
			let authUserId5 = adminAuthRegister('mail@gmail.com','Password12sdf3','Joh nny-Bone',"Jo'nes");
			let authUserId = adminAuthLogin('goyeama@gmail.com','Pasworadsa2d123');
			expect(authUserId).toStrictEqual({error: 'Username or Password is not valid'});
		});
		test('2. Wrong Email', () => {
			let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
			let authUserId2 = adminAuthLogin('good.ema@gmail.com','Password123');
			expect(authUserId2).toStrictEqual({error: 'Username or Password is not valid'});
		});
		test('3. Wrong Password', () => {
			let authUserId1 = adminAuthRegister('good.ail@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
			let authUserId2 = adminAuthRegister('gooemail@gmail.com','Password121233','Joh nny-Bone',"Jo'nes");
			let authUserId = adminAuthLogin('good.ail@gmail.com','Passw15g23');
			expect(authUserId).toStrictEqual({error: 'Username or Password is not valid'});
		});
	});
	describe ('User accidentaly uses wrong password with correct username', () => {
		let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
		let authUserId2 = adminAuthLogin('good.email@gmail.com','Password12');
		let authUserId3 = adminAuthLogin('good.email@gmail.com','Passwod123');
		let authUserId4 = adminAuthLogin('good.email@gmail.com','Password123');
		expect(authUserId).toStrictEqual(authUserId4);
	});
});
