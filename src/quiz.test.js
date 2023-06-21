import { adminAuthLogin, adminAuthRegister, adminUserDetails } from './auth.js';
import { adminQuizDescriptionUpdate, adminQuizRemove, adminQuizCreate,
  adminQuizList, adminQuizNameUpdate,adminQuizInfo} from './quiz.js';
import { clear } from './other.js'



beforeEach(() => {
	clear();
});

describe('adminQuizList function', () => {
    let authUserId;

    beforeEach(() => {
        authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
    });
    
    test('Invalid authUserId format', () => {
        expect(adminQuizList(' ')). toStrictEqual({
            quizzes: [

            ]
        });
    });

    test('User without no owned quizzes', () => {
        expect(adminQuizList(authUserId)).toStrictEqual({
            quizzes: [

            ]
        });
    });

    test('User with one owned quiz', () => {
        const adminQuiz1Name = 'CountriesoftheWorld';
        const {adminQuizId1} = adminQuizCreate(authUserId, adminQuiz1Name, 'Quiz on all countries');
        expect(adminQuizList(authUserId)).toStrictEqual({
            quizzes: [
                {
                    quizId: adminQuizId1,
                    name: adminQuiz1Name
                }
            ]
        });
    });

    test('User with multiple owned quiz', () => {
        const adminQuiz1Name = 'CountriesoftheWorld';
        const adminQuiz2Name = 'FlagsoftheWorld';
        const {adminQuizId1} = adminQuizCreate(authUserId, adminQuiz1Name, 'Quiz on all countries');
        const {adminQuizId2} = adminQuizCreate(authUserId, adminQuiz2Name, 'Quiz on all flags');
        expect(adminQuizList(authUserId)).toStrictEqual({
            quizzes: [
                {
                    quizId: adminQuizId1,
                    name: adminQuiz1Name
                },
                {
                    quizId: adminQuizId2,
                    name: adminQuiz2Name
                }
            ]
        });
    });

});



describe("adminQuizCreate tests", () => {
  let user;

  beforeEach(() => {
    user = adminAuthRegister('JohnSmith@gmail.com','Password123','John','Smith');
  });

  describe("Unsuccessful tests", () => {
    test('User does not exists)', () => {
      expect(adminQuizCreate((-999), 'kelly', 'quiz')).toStrictEqual({ error: "User Does Not Exist"});
    });

    test('No name error', () => {
      expect(adminQuizCreate(user.authUserId, '', 'quizforcomp')).toStrictEqual({
        error: "A name must be entered"});
    });

    test('Non alphanumeric name entered', () => {
      expect(adminQuizCreate(user.authUserId, '<name>', 'quiz')).toStrictEqual({ 
        error: "Must use only alphanumeric characters or spaces in name"});
    });

    test('Less than 3 characters', () => {
      expect(adminQuizCreate(user.authUserId, 'li', 'quiz')).toStrictEqual({
        error: "Name must be between 3 and 30 characters"});
    });

    test('More than 30 characters', () => {
      expect(adminQuizCreate(user.authUserId, 'abcdefghijklmnopqrstuvwxyz12345', 'quiz')).toStrictEqual(
        { error: "Name must be between 3 and 30 characters"});
    });

    test('Name is already used by another quiz from same user', () => {
      let quiz1 = adminQuizCreate(user.authUserId, 'comp1531it1', 'quiz');
      let quiz2 = adminQuizCreate(user.authUserId, 'comp1531it1', 'quiz2');
      expect(quiz2).toStrictEqual({ error: 'Quiz name already in use'});
    });
    
    test('Description more than 100 characters ', () => {
      expect(adminQuizCreate(user.authUserId, 'comp1531', 
      'q7LzFg2hI4rR8tY0uOp2S3dE6fG1hJ4kL0zXcV3bN6mI8qW2aS5dF7gH0jK9lP1oR4tY7uI0pS3dF6gH9jK2llP5oR8tY1uI4pS7dF0gH3H')
      ).toStrictEqual({ error: "Description must be under 100 characters"});
    });
  });

  describe("Successful tests", () => {
    test('Sucessful Quiz Creation', () => {
      expect(adminQuizCreate(user.authUserId, 'Science Quiz', 'quiz about science')).toStrictEqual(
        expect.objectContaining({
          quizId: expect.any(Number),
        })
      );
    });

    test('Sucessful Quiz Creation with no description', () => {
        expect(adminQuizCreate(user.authUserId, 'Science Quiz', '')).toStrictEqual(
          expect.objectContaining({
            quizId: expect.any(Number),
          })
        );
    });

    test('Sucessful Quiz Creation with numbers and letters', () => {
        expect(adminQuizCreate(user.authUserId, 'Sci3nce Qu1z', '123ABCD')
          ).toStrictEqual(
            expect.objectContaining({
              quizId: expect.any(Number),
            })
          );
      });
  });


});