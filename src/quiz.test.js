import { adminAuthLogin, adminAuthRegister } from './auth.js';
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
        const adminQuiz1Name = 'Countries of the World';
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
        const adminQuiz1Name = 'Countries of the World';
        const adminQuiz2Name = 'Flags of the World';
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
    
  describe("unsuccessful tests", () => {

  test('1. user does not exists)', () => {
    const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
    expect(adminQuizCreate((-999), 'kelly', 'quiz')).toStrictEqual({ error: "User Does Not Exist"});
});
  test('2. no name error', () => {
    const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
    expect(adminQuizCreate(user.authUserId, '', 'quizforcomp')).toStrictEqual({
       error: "must enter a name"});
  });
  test('3. non alphanumeric name entered', () => {
    const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
    expect(adminQuizCreate(user.authUserId, '<name>', 'quiz')).toStrictEqual({ 
      error: "Must use only alphanumeric characters in name"});
  });
  test('4. less than 3 characters', () => {
    const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
    expect(adminQuizCreate(user.authUserId, 'li', 'quiz')).toStrictEqual({
       error: "name must be between 3 and 30 characters"});
  });
  test('5. more than 30 characters', () => {
    const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
    expect(adminQuizCreate(user.authUserId, 'abcdefghijklmnopqrstuvwxyz12345', 'quiz')).toStrictEqual(
      { error: "name must be between 3 and 30 characters"});
  });
  test('6. name is alr used by another quiz from same user', () => {
    const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
    let quiz1 = adminQuizCreate(user.authUserId, 'comp1531it1', 'quiz');
    let quiz2 = adminQuizCreate(user.authUserId, 'comp1531it1', 'quiz');
    expect(quiz2).toStrictEqual({ error: 'quiz name already in use'});
  });
  test('7. description more than 100 characters ', () => {
    const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
    expect(adminQuizCreate(user.authUserId, 'comp1531', 
    'q7LzFg2hI4rR8tY0uOp2S3dE6fG1hJ4kL0zXcV3bN6mI8qW2aS5dF7gH0jK9lP1oR4tY7uI0pS3dF6gH9jK2llP5oR8tY1uI4pS7dF0gH3H')
    ).toStrictEqual({ error: "description must be under 100 characters"});
  });
});

  describe("successful tests", () => {
    test('1. Sucessful Quiz Creation', () => {
      const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
      expect(adminQuizCreate(user.authUserId, 'ScienceQuiz', 'quiz about science')
      ).toStrictEqual(
        expect.objectContaining({
          quizId: expect.any(Number),
        })
      );
      });
      test('2. Sucessful Quiz Creation w no description', () => {
        const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
        expect(adminQuizCreate(user.authUserId, 'ScienceQuiz', '')).toStrictEqual(
          expect.objectContaining({
            quizId: expect.any(Number),
          })
        );
        });
        test('3. Sucessful Quiz Creation w numbers and letters', () => {
          const user = adminAuthRegister('good.email@gmail.com','Password123','Joh nny-Bone','Jo\'nes');
          expect(adminQuizCreate(user.authUserId, 'Sci3nceQu1z', '123ABCD')
          ).toStrictEqual(
            expect.objectContaining({
              quizId: expect.any(Number),
            })
          );
          });
    });

});