//Clear Function Tests
import { clear } from './other.js';
import { getData } from './dataStore.js';
import { adminAuthRegister } from './auth.js'

test('Test successful clear', () => {
	let person1_id = adminAuthRegister('good.l@gl.com','Password123','Joh nny-Bone',"Jo'nes");	
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
  