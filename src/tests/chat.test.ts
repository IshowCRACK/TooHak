import { AdminQuizCreate, PlayerReturn, QuestionBody, Token, Jwt, OkSessionObj } from '../../interfaces/interfaces';
import { viewChatHandler, pushChatForViewChatHandler, startSessionQuiz, createQuizQuestionHandlerV2, sendChatHandler } from './testhelpersV2';
import { playerJoinHelper, RequestCreateQuizV2 } from './testhelpersV2';
import { clearUsers, registerUser } from './iter2tests/testHelpersv1';
import { tokenToJwt } from '../token';

beforeEach(() => {
  clearUsers();
});

afterEach(() => {
  clearUsers();
});

describe('Tests for viewChat', () => {
  let userJwt: Jwt;
  let userToken: Token;
  let quizId: number;
  let defaultQuestionBody : QuestionBody;
  let sessionId: number;
  let playerId: number;
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
    sessionId = (startSessionQuiz(userJwt, 30, quizId) as OkSessionObj).sessionId;
    playerId = (playerJoinHelper(sessionId, 'peahead') as PlayerReturn).playerId;
  });
  expect(playerId).toStrictEqual(playerId);

  describe('Unsuccessful Attempts', () => {
    test('playerId does not exist', () => {
      expect(viewChatHandler(10)).toStrictEqual({ error: 'Player ID is not valid' });
    });
  });

  describe('Successful Attempts', () => {
    test('Empty chat', () => {
      expect(viewChatHandler(playerId)).toStrictEqual({ messages: [] });
    });
    test('One message from one user', () => {
      pushChatForViewChatHandler(playerId, sessionId, 'I had a dream');
      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
          },
        ]
      });
    });
    test('Multiple messages from one user', () => {
      pushChatForViewChatHandler(playerId, sessionId, 'I had a dream');
      pushChatForViewChatHandler(playerId, sessionId, 'I got everything I wanted');
      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
          },
          {
            messageBody: 'I got everything I wanted',
            playerId: playerId,
          }
        ]
      });
    });
    test('Messages from multiple users', () => {
      pushChatForViewChatHandler(playerId, sessionId, 'I had a dream');
      const player2Id: number = (playerJoinHelper(sessionId, 'doostin') as PlayerReturn).playerId;
      pushChatForViewChatHandler(player2Id, sessionId, 'I got everything I wanted');
      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
          },
          {
            messageBody: 'I got everything I wanted',
            playerId: player2Id,
          }
        ]
      });
    });
  });
});

describe('Tests for sendChat', () => {
  let userJwt: Jwt;
  let userToken: Token;
  let quizId: number;
  let defaultQuestionBody : QuestionBody;
  let sessionId: number;
  let playerId: number;
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
    sessionId = (startSessionQuiz(userJwt, 30, quizId) as OkSessionObj).sessionId;
    playerId = (playerJoinHelper(sessionId, 'peahead') as PlayerReturn).playerId;
  });
  expect(playerId).toStrictEqual(playerId);

  describe('Unsuccessful Attempts', () => {
    test('playerId does not exist', () => {
      expect(sendChatHandler(10, 'I had a dream')).toStrictEqual({ error: 'Player ID is not valid' });
    });
    test('Chat length less than 1 character', () => {
      expect(sendChatHandler(10, '')).toStrictEqual({ error: 'Player ID is not valid' });
    });
    test('Chat length greater than 100 characters', () => {
      expect(sendChatHandler(10, '')).toStrictEqual({ error: 'Player ID is not valid' });
    });
  });

  describe('Successful Attempts', () => {
    test('One message from one user', () => {
      sendChatHandler(playerId, 'I had a dream');
      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
          },
        ]
      });
    });
    test('Sending multiple messages from one user', () => {
      sendChatHandler(playerId, 'I had a dream');
      sendChatHandler(playerId, 'I got everything I wanted');
      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
          },
          {
            messageBody: 'I got everything I wanted',
            playerId: playerId,
          }
        ]
      });
    });
    test('Sending a single message from multiple users', () => {
      sendChatHandler(playerId, 'I had a dream');
      const player2Id: number = (playerJoinHelper(sessionId, 'doostin') as PlayerReturn).playerId;
      sendChatHandler(player2Id, 'I got everything I wanted');
      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
          },
          {
            messageBody: 'I got everything I wanted',
            playerId: player2Id,
          }
        ]
      });
    });
    test('Sending multiple messages from multiple users', () => {
      sendChatHandler(playerId, 'I had a dream');
      const player2Id: number = (playerJoinHelper(sessionId, 'doostin') as PlayerReturn).playerId;
      sendChatHandler(player2Id, 'I got everything I wanted');
      sendChatHandler(playerId, 'Not what youd think');
      sendChatHandler(player2Id, 'And if Im being honest');
      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
          },
          {
            messageBody: 'I got everything I wanted',
            playerId: player2Id,
          },
          {
            messageBody: 'Not what youd think',
            playerId: playerId,
          },
          {
            messageBody: 'And if Im being honest',
            playerId: player2Id,
          }
        ]
      });
    });
  });
});