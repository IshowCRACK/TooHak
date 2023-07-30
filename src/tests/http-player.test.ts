import { AdminQuizCreate, Jwt, QuestionBody, Token, OkSessionObj, QuizQuestionCreate, PlayerReturn } from '../../interfaces/interfaces';
import { clearUsers, registerUser } from './iter2tests/testHelpersv1';
import { RequestCreateQuizV2, createQuizQuestionHandlerV2, startSessionQuiz, playerJoinHelper, updateQuizSessionStateHandler, playerQuestionInfoHelper } from './testhelpersV2';
import { tokenToJwt } from '../token';

beforeEach(() => {
  clearUsers();
});

afterEach(() => {
  clearUsers();
});

describe('PlayerJoin', () => {
  let userJwt: Jwt;
  let userToken: Token;
  let quizId: number;
  let defaultQuestionBody : QuestionBody;
  let sessionId: OkSessionObj;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);

    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    defaultQuestionBody = {
      question: 'What content is Russia in?',
      duration: 5,
      points: 1,
      answers: [
        {
          answerId: 0,
          answer: 'Asia',
          colour: 'Red',
          correct: true
        },
        {
          answerId: 1,
          answer: 'North America',
          colour: 'Blue',
          correct: false
        },
        {
          answerId: 2,
          answer: 'South America',
          colour: 'Green',
          correct: false
        },
        {
          answerId: 3,
          answer: 'Africa',
          colour: 'Yellow',
          correct: false
        }
      ],
      thumbnailUrl: 'https://static.vecteezy.com/system/resources/previews/001/204/011/original/soccer-ball-png.png'
    };
    createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody);
    sessionId = startSessionQuiz(userJwt, 30, quizId) as OkSessionObj;
  });

  describe('Unsuccessful Cases', () => {
    test('Name of user entered is not unique', () => {
      playerJoinHelper(sessionId.sessionId, 'Jane Doe');
      expect(playerJoinHelper(sessionId.sessionId, 'Jane Doe')).toStrictEqual({
        error: 'Name of user entered is not unique'
      });
    });

    test('Session is not in LOBBY state', () => {
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'END');
      expect(playerJoinHelper(sessionId.sessionId, 'Jane Doe')).toStrictEqual({
        error: 'Session is not in LOBBY state'
      });
    });
  });

  describe('Successful Cases', () => {
    test('Add 1 player', () => {
      expect(playerJoinHelper(sessionId.sessionId, 'Jane Doe')).toEqual(
        {
          playerId: 1
        }
      );
    });
    test('Add 2 players', () => {
      expect(playerJoinHelper(sessionId.sessionId, 'Jane Doe')).toEqual(
        {
          playerId: 1
        });

      expect(playerJoinHelper(sessionId.sessionId, 'John Doe')).toEqual(
        {
          playerId: 2
        });
    });

    test('Add 1 player no name', () => {
      expect(playerJoinHelper(sessionId.sessionId, '')).toEqual(
        {
          playerId: 1
        }
      );
    });
  });
});

describe('PlayerQuestionInfo', () => {
  let userJwt: Jwt;
  let userToken: Token;
  let quizId: number;
  let defaultQuestionBody2 : QuestionBody;
  let sessionId: OkSessionObj;
  let playerId: PlayerReturn;
  let questionId2: QuizQuestionCreate;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);

    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    defaultQuestionBody2 = {
      question: 'What content is Japan in?',
      duration: 5,
      points: 1,
      answers: [
        {
          answerId: 0,
          answer: 'Asia',
          colour: 'Red',
          correct: true
        },
        {
          answerId: 1,
          answer: 'North America',
          colour: 'Blue',
          correct: false
        },
        {
          answerId: 2,
          answer: 'South America',
          colour: 'Green',
          correct: false
        },
        {
          answerId: 3,
          answer: 'Africa',
          colour: 'Yellow',
          correct: false
        }
      ],
      thumbnailUrl: 'https://static.vecteezy.com/system/resources/previews/001/204/011/original/soccer-ball-png.png'
    };
    questionId2 = createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody2) as QuizQuestionCreate;
    sessionId = startSessionQuiz(userJwt, 30, quizId) as OkSessionObj;
    playerId = playerJoinHelper(sessionId.sessionId, 'John Doe') as PlayerReturn;
  });
  describe('Unsuccessful ', () => {
    test('PlayerId does not exist', () => {
      expect(playerQuestionInfoHelper(playerId.playerId + 1, 0)).toStrictEqual({
        error: 'player ID does not exist'
      });
    });

    test('Question position is not valid for the session this player is in', () => {
      expect(playerQuestionInfoHelper(playerId.playerId, 10)).toStrictEqual({
        error: 'Question position is not valid for the session this player is in'
      });
    });

    test('If session is not currently on this question', () => {
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'NEXT_QUESTION');
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'NEXT_QUESTION');
      expect(playerQuestionInfoHelper(playerId.playerId, 0)).toStrictEqual({
        error: 'If session is not currently on this question'
      });
    });

    test('Session is in LOBBY or END state', () => {
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'LOBBY');
      expect(playerQuestionInfoHelper(playerId.playerId, 0)).toStrictEqual({
        error: 'Session is in LOBBY or END state'
      });
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'END');
      expect(playerQuestionInfoHelper(playerId.playerId, 0)).toStrictEqual({
        error: 'Session is in LOBBY or END state'
      });
    });
  });

  describe('Successful', () => {
    test('Success', () => {
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'NEXT_QUESTION');
      expect(playerQuestionInfoHelper(playerId.playerId, 1)).toEqual(
        {
          questionId: questionId2.questionId,
          question: 'What content is Japan in?',
          duration: 5,
          thumbnailUrl: 'https://static.vecteezy.com/system/resources/previews/001/204/011/original/soccer-ball-png.png',
          points: 1,
          answers: [
            {
              answerId: 0,
              answer: 'Asia',
              colour: 'Red'
            },
            {
              answerId: 1,
              answer: 'North America',
              colour: 'Blue'
            },
            {
              answerId: 2,
              answer: 'South America',
              colour: 'Green'
            },
            {
              answerId: 3,
              answer: 'Africa',
              colour: 'Yellow'
            }
          ]
        });
    });
  });
});
