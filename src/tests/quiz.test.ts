import { adminAuthRegister } from '../auth';
import {
  adminQuizDescriptionUpdate, adminQuizRemove, adminQuizCreate,
  adminQuizList, adminQuizNameUpdate, adminQuizInfo
} from '../quiz';
import { clear } from '../other';
import { AdminAuthRegister, AdminQuizCreate, AdminQuizDescriptionUpdate, AdminQuizInfo, AdminQuizNameUpdate } from '../../interfaces/interfaces';

beforeEach(() => {
  clear();
});

describe('adminQuizList tests', () => {
  let authUserId: number;

  beforeEach(() => {
    authUserId = (adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith') as AdminAuthRegister).authUserId;
  });

  describe('Unsuccessful tests', () => {
    test('Invalid authUserId format', () => {
      expect(adminQuizList(1)).toStrictEqual({
        error: 'AuthUserId is not a valid user'
      });
    });
  });

  describe('Successful tests', () => {
    test('User without no owned quizzes', () => {
      expect(adminQuizList(authUserId)).toStrictEqual({
        quizzes: [

        ]
      });
    });

    test('User with one owned quiz', () => {
      const adminQuiz1Name = 'Countries of the World';
      const adminQuizId1 = (adminQuizCreate(authUserId, adminQuiz1Name, 'Quiz on all countries') as AdminQuizCreate).quizId;
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
      const adminQuizId1 = (adminQuizCreate(authUserId, adminQuiz1Name, 'Quiz on all countries') as AdminQuizCreate).quizId;
      const adminQuizId2 = (adminQuizCreate(authUserId, adminQuiz2Name, 'Quiz on all flags') as AdminQuizCreate).quizId;
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
});

describe('adminQuizCreate tests', () => {
  let authUserId: number;

  beforeEach(() => {
    authUserId = (adminAuthRegister('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as AdminAuthRegister).authUserId;
  });

  describe('Unsuccessful tests', () => {
    test('AuthUserId is not a valid user', () => {
      expect(adminQuizCreate(-5, 'John', 'Smith')).toStrictEqual({ error: 'AuthUserId is not a valid user' });
    });

    test('No name error', () => {
      expect(adminQuizCreate(authUserId, '', 'quizforcomp')).toStrictEqual({ error: 'A name must be entered' });
    });

    test('Non alphanumeric name entered', () => {
      expect(adminQuizCreate(authUserId, '<name>', 'quiz')).toStrictEqual({ error: 'Must use only alphanumeric characters or spaces in name' });
    });

    test('Less than 3 characters', () => {
      expect(adminQuizCreate(authUserId, 'li', 'quiz')).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('More than 30 characters', () => {
      expect(adminQuizCreate(authUserId, 'abcdefghijklmnopqrstuvwxyz12345', 'quiz')).toStrictEqual(
        { error: 'Name must be between 3 and 30 characters' });
    });

    test('Name is already used by another quiz from same user', () => {
      adminQuizCreate(authUserId, 'comp1531it1', 'quiz');
      const quiz = adminQuizCreate(authUserId, 'comp1531it1', 'quiz2');
      expect(quiz).toStrictEqual({ error: 'Quiz name is already in use' });
    });

    test('Description more than 100 characters ', () => {
      expect(adminQuizCreate(authUserId, 'comp1531',
        'q7LzFg2hI4rR8tY0uOp2S3dE6fG1hJ4kL0zXcV3bN6mI8qW2aS5dF7gH0jK9lP1oR4tY7uI0pS3dF6gH9jK2llP5oR8tY1uI4pS7dF0gH3H')
      ).toStrictEqual({ error: 'Description must be under 100 characters' });
    });
  });

  describe('Successful tests', () => {
    test('Sucessful Quiz Creation', () => {
      expect(adminQuizCreate(authUserId, 'Science Quiz', 'quiz about science')).toStrictEqual({ quizId: 0 });
    });

    test('Sucessful Quiz Creation with no description', () => {
      expect(adminQuizCreate(authUserId, 'Science Quiz', '')).toStrictEqual({ quizId: 0 });
    });

    test('Sucessful Quiz Creation with numbers and letters', () => {
      expect(adminQuizCreate(authUserId, 'Sci3nce Qu1z', '123ABCD')
      ).toStrictEqual({ quizId: 0 });
    });

    test('Sucessful Quiz Creation with 2 quizzes', () => {
      expect(adminQuizCreate(authUserId, 'Sci3nce Qu1z', '123ABCD')
      ).toStrictEqual({ quizId: 0 });
      expect(adminQuizCreate(authUserId, 'P7sics Qu1z', '123ABCD')
      ).toStrictEqual({ quizId: 1 });
    });
  });
});

describe('adminQuizRemove tests', () => {
  let authUserId: number;

  beforeEach(() => {
    authUserId = (adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith') as AdminAuthRegister).authUserId;
  });

  describe('Unsuccessful tests', () => {
    test('Invalid authUserId', () => {
      const quizId = (adminQuizCreate(authUserId, 'QuizaboutBarbie', 'Quiz on all flags') as AdminQuizCreate).quizId;
      expect(adminQuizRemove(-10, quizId)).toStrictEqual({ error: 'AuthUserId is not a valid user' });
      expect(adminQuizRemove(1, quizId)).toStrictEqual({ error: 'AuthUserId is not a valid user' });
    });

    test('Invalid quizId', () => {
      adminQuizCreate(authUserId, 'QuizaboutBarbie', 'Quiz on barbies');
      expect(adminQuizRemove(authUserId, -10)).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('quizId does not refer to a quiz that this user owns', () => {
      const authUserId2 = (adminAuthRegister('mimi@gmail.com', 'password123', 'mimi', 'rabbit') as AdminAuthRegister).authUserId;
      const quizId = (adminQuizCreate(authUserId, 'QuizaboutBarbie', 'Quiz on barbies') as AdminQuizCreate).quizId;
      expect(adminQuizRemove(authUserId2, quizId)).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
  });

  describe('Successful functions', () => {
    test('Removing one quiz from one user', () => {
      const quizId = (adminQuizCreate(authUserId, 'QuizaboutBarbie', 'Quiz on barbies') as AdminQuizCreate).quizId;
      expect(adminQuizRemove(authUserId, quizId)).toStrictEqual(
        {
        }
      );
    });
    test('Removing multiple quizzes from one user', () => {
      const quizId1 = (adminQuizCreate(authUserId, 'QuizaboutBarbie', 'Quiz on barbies') as AdminQuizCreate).quizId;
      const quizId2 = (adminQuizCreate(authUserId, 'QuizaboutBarbieMovies', 'Quiz on barbies') as AdminQuizCreate).quizId;
      expect(adminQuizRemove(authUserId, quizId1)).toStrictEqual(
        {
        }
      );

      expect(adminQuizRemove(authUserId, quizId2)).toStrictEqual(
        {
        }
      );
    });

    test('Removing one quiz out of multiple from one user ', () => {
      adminQuizCreate(authUserId, 'QuizaboutBarbie', 'Quiz on barbies');
      const quizId = (adminQuizCreate(authUserId, 'QuizaboutBarbieMovies', 'Quiz on barbies') as AdminQuizCreate).quizId;
      adminQuizCreate(authUserId, 'QuizaboutBarbietoys', 'Quiz on barbies toys');
      expect(adminQuizRemove(authUserId, quizId)).toStrictEqual(
        {
        }
      );
    });

    test('Removing multiple quizzes from multiple users  ', () => {
      const authUserId2 = (adminAuthRegister('hello@gmail.com', 'passrd123', 'hello', 'guys') as AdminAuthRegister).authUserId;
      const quizId1 = (adminQuizCreate(authUserId, 'QuizaboutBarbie', 'Quiz on barbies') as AdminQuizCreate).quizId;
      const quizId2 = (adminQuizCreate(authUserId, 'QuizaboutBarbieMovies', 'Quiz on barbies') as AdminQuizCreate).quizId;

      const quizId3 = (adminQuizCreate(authUserId2, 'QuizaboutMovies', 'Quiz on movies') as AdminQuizCreate).quizId;
      const quizId4 = (adminQuizCreate(authUserId2, 'Quizabouttoys', 'Quiz on  toys') as AdminQuizCreate).quizId;
      expect(adminQuizList(authUserId)).toStrictEqual({
        quizzes: [
          {
            quizId: quizId1,
            name: 'QuizaboutBarbie'
          },
          {
            quizId: quizId2,
            name: 'QuizaboutBarbieMovies'
          }
        ]

      }
      );
      expect(adminQuizRemove(authUserId, quizId1)).toStrictEqual(
        {
        }
      );
      expect(adminQuizList(authUserId)).toStrictEqual({
        quizzes: [
          {
            quizId: quizId2,
            name: 'QuizaboutBarbieMovies'
          }
        ]

      }
      );
      expect(adminQuizList(authUserId2)).toStrictEqual({
        quizzes: [
          {
            quizId: quizId3,
            name: 'QuizaboutMovies'
          },
          {
            quizId: quizId4,
            name: 'Quizabouttoys'
          }
        ]

      }
      );

      expect(adminQuizRemove(authUserId2, quizId4)).toStrictEqual(
        {
        }
      );
      expect(adminQuizList(authUserId2)).toStrictEqual({
        quizzes: [
          {
            quizId: quizId3,
            name: 'QuizaboutMovies'
          }
        ]

      }
      );
    });
  });
});

describe('adminQuizInfo', () => {
  let authUserId: number;
  let quizId: number;
  let quizCreationTime: number;
  const adminQuizName = 'Countries of the World';
  const adminQuizDescription = 'Quiz on all countries';
  // Giving a 10 second buffer for tests to run
  const timeBufferSeconds = 10;

  beforeEach(() => {
    authUserId = (adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith') as AdminAuthRegister).authUserId;
    quizCreationTime = Math.round(Date.now() / 1000);
    quizId = (adminQuizCreate(authUserId, adminQuizName, adminQuizDescription) as AdminQuizCreate).quizId;
  });

  describe('Unsuccessful tests', () => {
    test('Invalid authUserId format', () => {
      expect(adminQuizInfo(-1, quizId)).toStrictEqual({ error: 'AuthUserId is not a valid user' });
    });

    test('Invalid quizId format', () => {
      expect(adminQuizInfo(authUserId, -1)).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('authUserId does not exist', () => {
      expect(adminQuizInfo(authUserId + 1, quizId)).toStrictEqual({ error: 'AuthUserId is not a valid user' });
    });

    test('quizId does not exist', () => {
      expect(adminQuizInfo(authUserId, quizId + 1)).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('authUserId does not correspond to the id of the quiz creator', () => {
      const authUserId2 = (adminAuthRegister('JaneJohnson@gmail.com', 'password123', 'Jane', 'Johnson') as AdminAuthRegister).authUserId;
      expect(adminQuizInfo(authUserId2, quizId)).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
  });

  describe('Successful tests', () => {
    test('valid authUserId and quizId for 1 owned quiz', () => {
      const quizInfo = adminQuizInfo(authUserId, quizId) as AdminQuizInfo;
      expect(quizInfo).toEqual(
        expect.objectContaining({
          quizId,
          name: adminQuizName,
          description: adminQuizDescription
        })
      );
      // checking if time created matches expected - 1000 millisecond buffer to account for execution time
      expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(quizCreationTime);
      expect(quizInfo.timeCreated).toBeLessThanOrEqual(quizCreationTime + timeBufferSeconds);
      expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime);
      expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(quizCreationTime + timeBufferSeconds);
    });

    test('valid authUserId and quizId for multiple owned quizzes', () => {
      const quizCreationTime2 = Math.round(Date.now() / 1000);
      const adminQuizName2 = 'Flags of the World';
      const adminQuizDescription2 = 'Quiz on All Flags';
      const quizId2 = (adminQuizCreate(authUserId, adminQuizName2, adminQuizDescription2) as AdminQuizCreate).quizId;

      const quizInfo = adminQuizInfo(authUserId, quizId) as AdminQuizInfo;
      const quizInfo2 = adminQuizInfo(authUserId, quizId2) as AdminQuizInfo;

      expect(quizInfo).toEqual(
        expect.objectContaining({
          quizId,
          name: adminQuizName,
          description: adminQuizDescription
        })
      );
      // checking if time created matches expected - 10 second buffer to account for execution time
      expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(quizCreationTime);
      expect(quizInfo.timeCreated).toBeLessThanOrEqual(quizCreationTime + timeBufferSeconds);
      expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime);
      expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(quizCreationTime + timeBufferSeconds);

      expect(quizInfo2).toEqual(
        expect.objectContaining({
          quizId: quizId2,
          name: adminQuizName2,
          description: adminQuizDescription2
        })
      );
      expect(quizInfo2.timeCreated).toBeGreaterThanOrEqual(quizCreationTime2);
      expect(quizInfo2.timeCreated).toBeLessThanOrEqual(quizCreationTime2 + timeBufferSeconds);
      expect(quizInfo2.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime2);
      expect(quizInfo2.timeLastEdited).toBeLessThanOrEqual(quizCreationTime2 + timeBufferSeconds);
    });
  });
});

describe('adminQuizDescriptionUpdate Tests', () => {
  // Giving a 10 second buffer for tests to run
  const timeBufferSeconds = 10;
  let quizEditedTime: number;
  beforeEach(() => {
    adminAuthRegister('something@gmail.com', 'password1', 'Ijlal', 'Khan');
    adminAuthRegister('joemama@gmail.com', 'password2', 'joe mama', 'mama joe');
    adminQuizCreate(0, 'Quiz 1', 'Description 1');
    adminQuizCreate(1, 'Quiz 2', 'Description 2');
    quizEditedTime = Math.round(Date.now() / 1000);
  });

  describe('Successful test', () => {
    test('Updates the description of an existing quiz', () => {
      const result = adminQuizDescriptionUpdate(0, 0, 'Updated description') as AdminQuizDescriptionUpdate;
      const getQuizinfo = adminQuizInfo(0, 0) as AdminQuizInfo;
      expect(getQuizinfo.description).toBe('Updated description');
      expect(result).toEqual({});
    });

    test('Updates Time edited', () => {
      const result = adminQuizDescriptionUpdate(0, 0, 'Updated description') as AdminQuizDescriptionUpdate;
      const getQuizinfo = adminQuizInfo(0, 0) as AdminQuizInfo;
      expect(getQuizinfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime);
      expect(getQuizinfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime + timeBufferSeconds);
      expect(result).toEqual({});
    });
  });

  describe('Unsuccessful test', () => {
    test('Returns an error when Quiz ID does not refer to a valid quiz', () => {
      const result = adminQuizDescriptionUpdate(0, 2, 'Updated description') as AdminQuizDescriptionUpdate;

      expect(result).toEqual({
        error: 'Quiz ID does not refer to a valid quiz'
      });
    });
  });

  test('Returns an error when Quiz ID does not refer to a quiz that this user owns', () => {
    const result = adminQuizDescriptionUpdate(0, 1, 'Updated description') as AdminQuizDescriptionUpdate;

    expect(result).toEqual({
      error: 'Quiz ID does not refer to a quiz that this user owns'
    });
  });

  test('Returns an error when AuthUserId is not a valid user', () => {
    const result = adminQuizDescriptionUpdate(-99, 0, 'Updated description') as AdminQuizDescriptionUpdate;

    expect(result).toEqual({
      error: 'AuthUserId is not a valid user'
    });
  });

  test('Returns an error when Description is more than 100 characters in length', () => {
    const result = adminQuizDescriptionUpdate(0, 0, 'This is a description that is more than 100 characters long. It should trigger an error. ?!@ #$& *%)_@ ;-))') as AdminQuizDescriptionUpdate;

    expect(result).toEqual({
      error: 'Description must be under 100 characters'
    });
  });
});

describe('adminQuizNameUpdate Tests', () => {
  const timeBufferSeconds = 10;
  let quizEditedTime: number;

  beforeEach(() => {
    adminAuthRegister('something@gmail.com', 'password1', 'Ijlal', 'Khan');
    adminAuthRegister('joemama@gmail.com', 'password2', 'joe mama', 'mama joe');
    quizEditedTime = Math.round(Date.now() / 1000);
    adminQuizCreate(0, 'Quiz 1', 'Description 1');
    adminQuizCreate(0, 'Quiz 2', 'Description 2');
    adminQuizCreate(1, 'Quiz 3', 'Description 3');
  });

  describe('Successful test', () => {
    test('Updates the name of an existing quiz', () => {
      const result = adminQuizNameUpdate(0, 0, 'Quiz 1 Updated') as AdminQuizNameUpdate;
      const getQuizinfo = adminQuizInfo(0, 0) as AdminQuizInfo;
      expect(getQuizinfo.name).toBe('Quiz 1 Updated');
      expect(result).toEqual({});
    });

    test('Updates the time edited', () => {
      const result = adminQuizNameUpdate(0, 0, 'Quiz 1 Updated') as AdminQuizNameUpdate;
      const getQuizinfo = adminQuizInfo(0, 0) as AdminQuizInfo;
      expect(getQuizinfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime);
      expect(getQuizinfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime + timeBufferSeconds);
      expect(result).toEqual({});
    });
  });

  describe('Unsuccessful test', () => {
    test('Returns an error when Quiz ID does not refer to a valid quiz', () => {
      const result = adminQuizNameUpdate(0, -9, 'Quiz 1 Updated') as AdminQuizNameUpdate;
      expect(result).toEqual({
        error: 'Quiz ID does not refer to a valid quiz'
      });
    });

    test('Returns an error when Quiz ID does not refer to a quiz that this user owns', () => {
      const result = adminQuizNameUpdate(0, 2, 'Quiz 1 Updated') as AdminQuizNameUpdate;

      expect(result).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns'
      });
    });

    test('Returns an error when AuthUserId is not a valid user', () => {
      const result = adminQuizNameUpdate(-99, 0, 'Quiz 1 Updated') as AdminQuizNameUpdate;

      expect(result).toEqual({
        error: 'AuthUserId is not a valid user'
      });
    });

    test('Returns an error when Name is more than 30 characters in length', () => {
      const result = adminQuizNameUpdate(0, 0, '123456789abcdEFGHsakfshfd214345') as AdminQuizNameUpdate;

      expect(result).toEqual({
        error: 'Name must be between 3 and 30 characters long!'
      });
    });

    test('Returns an error when Name less than 3 characters in length', () => {
      const result = adminQuizNameUpdate(0, 0, 'A') as AdminQuizNameUpdate;

      expect(result).toEqual({
        error: 'Name must be between 3 and 30 characters long!'
      });
    });

    test('Returns an error when Name has been used by current user', () => {
      const result = adminQuizNameUpdate(0, 0, 'Quiz 2') as AdminQuizNameUpdate;
      expect(result).toEqual({
        error: 'Quiz name already in use'
      });
    });
  });
});

describe('Additional tests', () => {
  test('Full implementation of all functions and its interactions', () => {
    const authUserId1 = (adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith') as AdminAuthRegister).authUserId;
    const authUserId2 = (adminAuthRegister('JaneAusten@gmail.com', 'password123', 'Jane', 'Austen') as AdminAuthRegister).authUserId;
    const authUserId3 = (adminAuthRegister('SteveRichards@gmail.com', 'password123', 'Steve', 'Richards') as AdminAuthRegister).authUserId;
    adminQuizCreate(authUserId2, 'Quiz 1', 'Description 1');
    const quizId2 = (adminQuizCreate(authUserId3, 'Quiz 2', 'Description 2') as AdminQuizCreate).quizId;
    const quizId3 = (adminQuizCreate(authUserId3, 'Quiz 3', 'Description 3') as AdminQuizCreate).quizId;

    // Testing if Quiz Creation, Removal and List works
    expect(adminQuizList(authUserId1)).toStrictEqual({
      quizzes: [

      ]
    });

    const quizId4 = (adminQuizCreate(authUserId1, 'Quiz 4', 'Description 4') as AdminQuizCreate).quizId;
    expect(adminQuizList(authUserId1)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId4,
          name: 'Quiz 4',
        }
      ]
    });

    expect(adminQuizList(authUserId3)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId2,
          name: 'Quiz 2',
        }, {
          quizId: quizId3,
          name: 'Quiz 3',
        }
      ]
    });

    expect(adminQuizRemove(authUserId3, quizId2)).toStrictEqual(
      {
      }
    );

    expect(adminQuizList(authUserId3)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId3,
          name: 'Quiz 3',
        }
      ]
    });

    // Testing if QuizInfo works along with description and name updates
    const timeBufferSeconds = 10;
    let quizEditedTime = Math.round(Date.now() / 1000);
    let getQuizInfo = adminQuizInfo(authUserId3, quizId3) as AdminQuizInfo;
    expect(getQuizInfo).toEqual(
      expect.objectContaining({
        quizId: quizId3,
        name: 'Quiz 3',
        description: 'Description 3'
      })
    );
    expect(getQuizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime);
    expect(getQuizInfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime + timeBufferSeconds);

    adminQuizDescriptionUpdate(authUserId3, quizId3, 'Updated description');

    quizEditedTime = Math.round(Date.now() / 1000);
    getQuizInfo = adminQuizInfo(authUserId3, quizId3) as AdminQuizInfo;
    expect(getQuizInfo).toEqual(
      expect.objectContaining({
        quizId: quizId3,
        name: 'Quiz 3',
        description: 'Updated description'
      })
    );
    expect(getQuizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime);
    expect(getQuizInfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime + timeBufferSeconds);

    adminQuizNameUpdate(authUserId3, quizId3, 'Quiz 3 Updated');
    quizEditedTime = Math.round(Date.now() / 1000);
    getQuizInfo = adminQuizInfo(authUserId3, quizId3) as AdminQuizInfo;
    expect(getQuizInfo).toEqual(
      expect.objectContaining({
        quizId: quizId3,
        name: 'Quiz 3 Updated',
        description: 'Updated description'
      })
    );
    expect(getQuizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime);
    expect(getQuizInfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime + timeBufferSeconds);
  });
});
