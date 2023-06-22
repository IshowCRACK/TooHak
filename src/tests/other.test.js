// Clear Function Tests
import { clear } from '../other.js';
import { adminAuthRegister } from '../auth.js';
import { getData } from '../dataStore.js';

test('Test successful clear', () => {
  const person1_id = adminAuthRegister('good.l@gl.com', 'Password123', 'Joh nny-Bone', "Jo'nes");
  clear();
  expect(getData()).toStrictEqual({
    users: [],
    quizzes: []
  });
});
