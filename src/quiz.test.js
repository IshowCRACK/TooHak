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



describe('adminQuizRemove function', () => {
    describe('unsuccessful function', () => {
    // when AuthUserId is not a valid user
    test('1. Invalid authUserId', () => {
        const authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
        const QuizId = adminQuizCreate(authUserId, "QuizaboutBarbie", 'Quiz on all flags').quizId;
        expect(adminQuizRemove(-10,  QuizId)).toStrictEqual({error:'User Does Not Exist'});
            
    });
    
        //Quiz ID does not refer to a valid quiz
    test.skip('2. Invalid QuizId', () => {
        const authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
        const QuizId = adminQuizCreate(authUserId, "QuizaboutBarbie", 'Quiz on barbies').quizId;
        expect(adminQuizRemove(authUserId, -10)).toStrictEqual({error: 'Invalid QuizId'});
    });

    //Quiz ID does not refer to a quiz that this user owns
    // wont work atm cause createQuiz is not merged 
    test.skip('3. Quiz ID does not refer to a quiz that this user owns', () => {
        const authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
        const authUserId2 = adminAuthRegister('mimi@gmail.com', 'password123', 'mimi', 'rabbit').authUserId;
        const QuizId = adminQuizCreate(authUserId, "QuizaboutBarbie", 'Quiz on barbies').quizId;

        expect(adminQuizRemove(authUserId2, QuizId)).toStrictEqual({error: 'Quiz ID does not refer to a quiz that this user own'});
    });
    });
// not working atm cause no createquiz
    describe.skip('successful functions', () => {
        /*
        1 quiz 1 user 
        2 quiz 1 user, delete quiz1
        2 quiz 1 user, delete quiz2
        */ 

        test('1. one user one quiz', () => {
            const authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
            const QuizId = adminQuizCreate(authUserId, "QuizaboutBarbie", 'Quiz on barbies').quizId;
            expect(adminQuizRemove(authUserId, QuizId)).toStrictEqual(
                {
                }
            );  
        });
        test('2. one user two quiz, remove quiz1', () => {
            const authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
            const QuizId1 = adminQuizCreate(authUserId, "QuizaboutBarbie", 'Quiz on barbies').quizId;
            const QuizId2 = adminQuizCreate(authUserId, "QuizaboutBarbieMovies", 'Quiz on barbies').quizId;
            expect(adminQuizRemove(authUserId, QuizId1)).toStrictEqual(
                {
                }
            );  
        });
        test('3. one user two quiz, remove quiz2', () => {
            const authUserId = adminAuthRegister('JohnSmith@gmail.com', 'password123', 'John', 'Smith').authUserId;
            const QuizId1 = adminQuizCreate(authUserId, "QuizaboutBarbie", 'Quiz on barbies').quizId;
            const QuizId2 = adminQuizCreate(authUserId, "QuizaboutBarbieMovies", 'Quiz on barbies').quizId;
            expect(adminQuizRemove(authUserId, QuizId2)).toStrictEqual(
                {
                }
            );  
        });

        });


    });

