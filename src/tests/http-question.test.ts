import request from "sync-request";
import { AdminQuizCreate, ErrorObj, QuestionBody, QuizQuestionCreate, Token } from "../../interfaces/interfaces";
import { getUrl } from "../helper";
import { RequestCreateQuiz, registerUser } from "./testHelpers";
import { jwtToToken, tokenToJwt } from "../token";
import { token } from "morgan";

const URL: string = getUrl();

const createQuizQuestionHandler = (quizId: number, token: Token, questionBody: QuestionBody) => {
    const res = request(
        'POST',
        URL + `v1/admin/quiz/${quizId}/question`,
        {
            json: questionBody
        }
    );

    const parsedResponse: QuizQuestionCreate | ErrorObj = JSON.parse(res.body.toString());

    return parsedResponse;
}

describe("Tests related to creating a Quiz Question", () => {
    let userToken: Token;
    let quizId: number;
    let defaultQuestionBody: QuestionBody;
    beforeEach(() => {
        userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith')  as Token;
        quizId = (RequestCreateQuiz(tokenToJwt(userToken), 'Countries of the World', "Quiz on Countries of the World") as AdminQuizCreate).quizId;

        defaultQuestionBody = {
            question: "What content is Russia in?",
            duration: 5,
            points: 1,
            answers: [
                {
                    answerId: 0,
                    answer: "Asia",
                    colour: "Red",
                    correct: true
                },
                {
                    answerId: 1,
                    answer: "North America",
                    colour: "Blue",
                    correct: false
                },
                {
                    answerId: 2,
                    answer: "South America",
                    colour: "Green",
                    correct: false
                },
                {
                    answerId: 3,
                    answer: "Africa",
                    colour: "Yellow",
                    correct: false
                }
            ]
        };
    });

    describe('Unsuccessful Tests', () => {
        test('QuizId does not refer to valid quiz', () => {
            expect(createQuizQuestionHandler(5, userToken, defaultQuestionBody)).toEqual({
                error: "QuizId does not refer to valid quiz"
            });
        });

        test('QuizId does not refer to a valid quiz that this user owns', () => {
            const userToken2: Token = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen')  as Token;
            expect(createQuizQuestionHandler(quizId, userToken2, defaultQuestionBody)).toEqual({
                error: 'QuizId does not refer to a valid quiz that this user owns'
            });
        });

        test('Question string is wrong format ', () => {
            defaultQuestionBody.question = "abcd"
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'Question string is less than 5 characters in length or greater than 50 characters in length'
            });

            defaultQuestionBody.question = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'Question string is less than 5 characters in length or greater than 50 characters in length'
            });
        });

        test('The Quesiton has incorrect number of answers', () => {
            defaultQuestionBody.answers.push({
                answerId: 5,
                answer: "Australia",
                colour: "Pink",
                correct: false
            });

            defaultQuestionBody.answers.push({
                answerId: 5,
                answer: "Antarctica",
                colour: "Black",
                correct: false
            });

            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'Question has more than 6 answers or less than 2 answers'
            });

            defaultQuestionBody.answers = [];

            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'Question has more than 6 answers or less than 2 answers'
            });
        });

        test('Question duration is negative', () => {
            defaultQuestionBody.duration = -1;
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'Question duration is not a positive number'
            });
        });

        test('Question duration is too long', () => {
            defaultQuestionBody.duration = 151;
            createQuizQuestionHandler(quizId, userToken, defaultQuestionBody);

            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'The sum of question durations in the quiz exceeds 3 minutes'
            });

        });

        test('Question points are invalid', () => {
            defaultQuestionBody.points = 0;

            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'The sum of question durations in the quiz exceeds 3 minutes'
            });

            defaultQuestionBody.points = 11;
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'The sum of question durations in the quiz exceeds 3 minutes'
            });
        });

        test('Invalid answer length', () => {
            defaultQuestionBody.answers[0].answer = ''
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
            });

            defaultQuestionBody.answers[0].answer = 'abcdefghijklmnopqrstuvwxyzabcde';
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'The length of any answer is shorter than 1 character long, or longer than 30 characters long'
            });
        });

        test('Answer string are duplicates', () => {
            defaultQuestionBody.answers[0].answer = 'North America';
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'Any answer strings are duplicates of one another (within the same question)'
            });         
        });

        test('There is no correct answers', () => {
            defaultQuestionBody.answers[0].correct = false;
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                error: 'There are no correct answers'
            });    
        });
    });

    describe('Successful Tests', () => {
        test('Test for single question creation', () => {
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                questionId: 0
            });  
        });

        test('Test for multiple question creations with multiple quizzes', () => {
            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                questionId: 0
            }); 

            expect(createQuizQuestionHandler(quizId, userToken, defaultQuestionBody)).toEqual({
                questionId: 1
            });       
            
            const quizId2: number = (RequestCreateQuiz(tokenToJwt(userToken), 'Flags of the World', "Quiz on Flags of the World") as AdminQuizCreate).quizId;
            expect(createQuizQuestionHandler(quizId2, userToken, defaultQuestionBody)).toEqual({
                questionId: 0
            }); 
        });
    });
});
