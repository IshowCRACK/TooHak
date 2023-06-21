import { adminAuthLogin, adminAuthRegister, adminUserDetails } from './auth.js';
import { adminQuizDescriptionUpdate, adminQuizRemove, adminQuizCreate,
  adminQuizList, adminQuizNameUpdate,adminQuizInfo} from './quiz.js';
import { clear } from './other.js'


beforeEach(() => {
	clear();
});

describe.skip('adminQuizList function', () => {
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


describe.skip('adminQuizInfo', () => {
    let authUserId;
    let quizId;
    let quizCreationTime;
    const adminQuizName = 'Countries of the World';
    const adminQuizDescription = 'Quiz on all countries';
    const timeBufferMillisecond = 1000;

    beforeEach(() => {
        authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
        quizCreationTime = Date.now();
        quizId = adminQuizCreate(authUserId, adminQuizName, adminQuizDescription).quizId;
    });

    test('Invalid authUserId format', () => {
        expect(adminQuizInfo('', quizId)).toStrictEqual({});
    });

    test('Invalid quizId format', () => {
        expect(adminQuizInfo(authUserId, '')).toStrictEqual({});
    });

    test('authUserId does not exist', () => {
        expect(adminQuizInfo(authUserId + 1, quizId)).toStrictEqual({});
    });

    test('quizId does not exist', () => {
        expect(adminQuizInfo(authUserId, quizId + 1)).toStrictEqual({});
    });

    test('authUserId does not correspond to the id of the quiz creator', () => {
        const authUserId2 = adminAuthRegister('JaneJohnson@gmail.com', 'password123', 'Jane', 'Johnson').authUserId;
        expect(adminQuizInfo(authUserId2, quizId )).toStrictEqual({});
    });

    test('valid authUserId and quizId for 1 owned quiz', () => {
        const quizInfo = adminQuizInfo(authUserId, quizId);
        expect(quizInfo).toEqual(
            expect.objectContaining({
                quizId: quizId,
                name: adminQuizName,
                description: adminQuizDescription
            })
        );    
        // checking if time created matches expected - 1000 millisecond buffer to account for execution time
        expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(quizCreationTime);
        expect(quizInfo.timeCreated).toBeLessThanOrEqual(quizCreationTime + timeBufferMillisecond);
        expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime);
        expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(quizCreationTime + timeBufferMillisecond);
    });

    test('valid authUserId and quizId for multiple owned quizzes', () => {
        const quizCreationDate2 = Date.now();
        const adminQuizName2 = 'Flags of the World';
        const adminQuizDescription2 = 'Quiz on All Flags'
        const quizId2 = adminQuizCreate(authUserId, adminQuizName2, adminQuizDescription2).quizId;

        const quizInfo = adminQuizInfo(authUserId, quizId);
        const quizInfo2 = adminQuizInfo(authUserId, quizId2);

        expect(quizInfo).toEqual(
            expect.objectContaining({
                quizId: quizId,
                name: adminQuizName,
                description: adminQuizDescription
            })
        );    
        // checking if time created matches expected - 1000 millisecond buffer to account for execution time
        expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(quizCreationTime);
        expect(quizInfo.timeCreated).toBeLessThanOrEqual(quizCreationTime + timeBufferMillisecond);
        expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime);
        expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(quizCreationTime + timeBufferMillisecond);

        expect(quizInfo2).toEqual(
            expect.objectContaining({
                quizId: quizId2,
                name: adminQuizName2,
                description: adminQuizDescription2
            })
        );    
        expect(quizInfo2.timeCreated).toBeGreaterThanOrEqual(quizCreationTime2);
        expect(quizInfo2.timeCreated).toBeLessThanOrEqual(quizCreationTime2 + timeBufferMillisecond);
        expect(quizInfo2.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime2);
        expect(quizInfo2.timeLastEdited).toBeLessThanOrEqual(quizCreationTime2 + timeBufferMillisecond);

    }); 
});

//adminQuizDescriptionUpdate
describe('adminQuizDescriptionUpdate Tests', () => {
    const timeBufferMillisecond = 1000;
    let quizCreationTime;
    beforeEach(() => {
      adminAuthRegister('something@gmail.com', 'password1', 'Ijlal', 'Khan');
      adminAuthRegister('joemama@gmail.com', 'password2', 'joe mama', 'mama joe');
      adminQuizCreate(0, 'Quiz 1', 'Description 1');
      adminQuizCreate(1, 'Quiz 2', 'Description 2');
      quizCreationTime = Date.now();
    });
  
    describe('1. Successful description update', () => {
      test('1. updates the description of an existing quiz', () => {
        const authUserId = 0;
        const quizId = 0;
        const newDescription = 'Updated description';
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
        const getQuizinfo = adminQuizInfo(authUserId,quizId);
        expect(getQuizinfo.description).toBe('Updated description');
        expect(result).toEqual({});
      });
    });
  
    describe('2. Unsuccessful description update - TESTING QUIZID', () => {
      test('1. returns an error when Quiz ID does not refer to a valid quiz', () => {
        const authUserId = 0;
        const quizId = 2;
        const newDescription = 'Updated description';
  
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
  
        expect(result).toEqual({
          error: 'Quiz ID does not refer to a valid quiz',
        });
      });
    });
  
    describe('3. Unsuccessful description update - TESTING MISSMATCHED QUIZID', () => {
      test('1. returns an error when Quiz ID does not refer to a quiz that this user owns', () => {
        const authUserId = 0;
        const quizId = 1;
        const newDescription = 'Updated description';
  
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
  
        expect(result).toEqual({
          error: 'Quiz ID does not refer to a quiz that this user owns',
        });
      });
    });
  
    describe('4. Unsuccessful description update - TESTING USERID', () => {
      test('1. returns an error when AuthUserId is not a valid user', () => {
        const authUserId = -99;
        const quizId = 0;
        const newDescription = 'Updated description';
  
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
  
        expect(result).toEqual({
          error: 'AuthUserId is not a valid user',
        });
      });
    });
  
    describe('5. Unsuccessful description update - TESTING DESCRIPTION LENGTH', () => {
      test('1. returns an error when Description is more than 100 characters in length', () => {
        const authUserId = 0;
        const quizId = 0;
        const newDescription = 'This is a description that is more than 100 characters long. It should trigger an error. ?!@ #$& *%)_@ ;-))';
  
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
  
        expect(result).toEqual({
          error: 'Description is more than 100 characters in length',
        });
      });
    });

    describe('6. Successful timeLastEdited description update - TESTING TIME LAST UPDATED', () => {
      test('1. returns an error when Description is more than 100 characters in length', () => {
        const authUserId = 0;
        const quizId = 0;
        const newDescription = 'Updated description';
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
        const getQuizinfo = adminQuizInfo(authUserId,quizId);
        expect(getQuizinfo.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime);
        expect(getQuizinfo.timeLastEdited).toBeLessThanOrEqual(quizCreationTime + timeBufferMillisecond);
        expect(result).toEqual({});
      });
    });
});

//adminQuizNameUpdate
describe('adminQuizNameUpdate Tests', () => {
  const timeBufferMillisecond = 1000;
  let quizCreationTime;

  beforeEach(() => {
    adminAuthRegister('something@gmail.com', 'password1', 'Ijlal', 'Khan');
    adminAuthRegister('joemama@gmail.com', 'password2', 'joe mama', 'mama joe');
    adminQuizCreate(0, 'Quiz 1', 'Description 1');
    adminQuizCreate(0, 'Quiz 2', 'Description 2');
    adminQuizCreate(1, 'Quiz 3', 'Description 3');
    quizCreationTime = Date.now();


  });

  describe('1. Successful Name update', () => {
    test('1. updates the name of an existing quiz', () => {
      const authUserId = 0;
      const quizId = 0;
      const newName = 'Quiz 1 Updated';
      const result = adminQuizNameUpdate(authUserId, quizId, newName);
      const getQuizinfo = adminQuizInfo(authUserId,quizId);
      expect(getQuizinfo.name).toBe('Quiz 1 Updated');
      expect(result).toEqual({});
    });
  });

  describe('2. Unsuccessful Name update - TESTING QUIZID', () => {
    test('1. returns an error when Quiz ID does not refer to a valid quiz', () => {
      const authUserId = 0;
      const quizId = -9;
      const newName = 'Quiz 1 Updated';

      const result = adminQuizNameUpdate(authUserId, quizId, newName);

      expect(result).toEqual({
        error: 'Quiz ID does not refer to a valid quiz',
      });
    });
  });

  describe('3. Unsuccessful name update - TESTING MISSMATCHED QUIZID', () => {
    test('1. returns an error when Quiz ID does not refer to a quiz that this user owns', () => {
      const authUserId = 0;
      const quizId = 2;
      const newName = 'Quiz 1 Updated';

      const result = adminQuizNameUpdate(authUserId, quizId, newName);

      expect(result).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns',
      });
    });
  });

  describe('4. Unsuccessful name update - TESTING USERID', () => {
    test('1. returns an error when AuthUserId is not a valid user', () => {
      const authUserId = -99;
      const quizId = 0;
      const newName = 'Quiz 1 Updated';

      const result = adminQuizNameUpdate(authUserId, quizId, newName);

      expect(result).toEqual({
        error: 'AuthUserId is not a valid user',
      });
    });
  });

  describe('5. Unsuccessful name update - TESTING NAME LENGTH', () => {
    test('1. returns an error when Name is more than 30 characters in length', () => {
      const authUserId = 0;
      const quizId = 0;
      const newName = '123456789abcdEFGHsakfshfd214345';

      const result = adminQuizNameUpdate(authUserId, quizId, newName);

      expect(result).toEqual({
        error: 'Name must be between 3 and 30 characters long!',
      });
    });

    test('2. returns an error when Name less than 3 characters in length', () => {
      const authUserId = 0;
      const quizId = 0;
      const newName = 'A';

      const result = adminQuizNameUpdate(authUserId, quizId, newName);

      expect(result).toEqual({
      error: 'Name must be between 3 and 30 characters long!',
      });
    });
  });

  describe('6. Unsuccessful name update - TESTING NAME DUPLICATE', () => {
    test('1. returns an error when Name has been used by current user', () => {
      const authUserId = 0;
      const quizId = 0;
      const newName = 'Quiz 2';

      const result = adminQuizNameUpdate(0,0,'Quiz 2')

      expect(result).toEqual({
        error: 'You have already used this name',
      });
    });
  });

  describe('1. Successful timeLastEdited Name update', () => {
    test('1. updates the name of an existing quiz', () => {
      const authUserId = 0;
      const quizId = 0;
      const newName = 'Quiz 1 Updated';
      const result = adminQuizNameUpdate(authUserId, quizId, newName);
      const getQuizinfo = adminQuizInfo(authUserId,quizId);
      expect(getQuizinfo.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime);
      expect(getQuizinfo.timeLastEdited).toBeLessThanOrEqual(quizCreationTime + timeBufferMillisecond);
      expect(result).toEqual({});
    });
  });
});
