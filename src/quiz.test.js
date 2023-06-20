import { adminAuthLogin, adminAuthRegister } from './auth.js';
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