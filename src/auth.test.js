import { adminAuthLogin, adminAuthRegister, adminUserDetails } from './auth.js';
import { clear } from './other.js'

beforeEach(() => {
	clear();
})


/*
describe('1. Successful authID', () => {

	test('1. Check successful register with 1 register', () => {
		let authUserId = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone',"Jo'nes");
		expect(authUserId).any({authUserId: Number});
	});
});*/

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
