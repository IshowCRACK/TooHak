//Clear Function Tests

import { clear } from './other.js';
import { getData } from './dataStore.js';
import { adminAuthRegister } from './auth.js'

test('Test successful clear', () => {
	let person1_id = adminAuthRegister('good.l@gl.com','Password123','Joh nny-Bone',"Jo'nes");
	//let quiz1_id= adminQuizCreate(person1_id,'how to drop comp1531', 'A comprehensive quiz to test students knowledge on how to quickly drop comp1531');
	
	clear();
	expect(getData()).toStrictEqual({
		users: [
					{

				}
			],
		quizes: [
					{

				}
			],
	});
});
  