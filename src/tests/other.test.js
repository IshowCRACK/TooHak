// Clear Function Tests
import { clear } from '../other.js';
import { adminAuthRegister } from '../auth.js';
import { getData } from '../dataStore.js';

describe('Clear tests', () => {
  test('Test successful clear', () => {
    adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith');
    clear();
    expect(getData()).toStrictEqual({
      users: [],
      quizzes: []
    });
  });
});
