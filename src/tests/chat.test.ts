import { AdminQuizCreate, PlayerReturn, QuestionBody, Token, Jwt, OkSessionObj, MessageReturn } from '../../interfaces/interfaces';
import {
  viewChatHandler, startSessionQuiz, createQuizQuestionHandlerV2, sendChatHandler, playerJoinHelper, RequestCreateQuizV2
} from './testhelpersV2';
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
  const timeBufferSeconds = 10;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);

    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    defaultQuestionBody = {
      question: 'What content is Russia in?',
      duration: 0.1,
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
      sendChatHandler(playerId, 'I had a dream');
      const sendChatTime = Math.round(Date.now() / 1000);

      expect((viewChatHandler(playerId) as MessageReturn).messages.length).toStrictEqual(1);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeGreaterThanOrEqual(sendChatTime);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeLessThanOrEqual(sendChatTime + timeBufferSeconds);
    });

    test('Multiple messages from one user', () => {
      sendChatHandler(playerId, 'I had a dream');
      const sendChatTime1 = Math.round(Date.now() / 1000);
      sendChatHandler(playerId, 'I got everything I wanted');
      const sendChatTime2 = Math.round(Date.now() / 1000);

      expect((viewChatHandler(playerId) as MessageReturn).messages.length).toStrictEqual(2);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeGreaterThanOrEqual(sendChatTime1);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeLessThanOrEqual(sendChatTime1 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeGreaterThanOrEqual(sendChatTime2);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeLessThanOrEqual(sendChatTime2 + timeBufferSeconds);
    });

    test('Messages from multiple users', () => {
      sendChatHandler(playerId, 'I had a dream');
      const sendChatTime1 = Math.round(Date.now() / 1000);
      const player2Id: number = (playerJoinHelper(sessionId, 'doostin') as PlayerReturn).playerId;
      sendChatHandler(player2Id, 'I got everything I wanted');
      const sendChatTime2 = Math.round(Date.now() / 1000);

      expect((viewChatHandler(playerId) as MessageReturn).messages.length).toStrictEqual(2);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeGreaterThanOrEqual(sendChatTime1);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeLessThanOrEqual(sendChatTime1 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeGreaterThanOrEqual(sendChatTime2);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeLessThanOrEqual(sendChatTime2 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].playerId).toStrictEqual(playerId);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].playerId).toStrictEqual(player2Id);
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
  const timeBufferSeconds = 10;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);

    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    defaultQuestionBody = {
      question: 'What content is Russia in?',
      duration: 0.1,
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

    test('Invalid chat length', () => {
      expect(sendChatHandler(playerId, '')).toStrictEqual({ error: 'Message body is less than 1 character or greater than 100 characters' });
    });
  });

  describe('Successful Attempts', () => {
    test('One message from one user', () => {
      sendChatHandler(playerId, 'I had a dream');
      const sendChatTime = Math.round(Date.now() / 1000);

      expect((viewChatHandler(playerId) as MessageReturn).messages.length).toStrictEqual(1);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].messageBody).toStrictEqual('I had a dream');
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeGreaterThanOrEqual(sendChatTime);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeLessThanOrEqual(sendChatTime + timeBufferSeconds);
    });

    test('Sending multiple messages from one user', () => {
      sendChatHandler(playerId, 'I had a dream');
      const sendChatTime1 = Math.round(Date.now() / 1000);
      sendChatHandler(playerId, 'I got everything I wanted');
      const sendChatTime2 = Math.round(Date.now() / 1000);

      expect((viewChatHandler(playerId) as MessageReturn).messages.length).toStrictEqual(2);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeGreaterThanOrEqual(sendChatTime1);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeLessThanOrEqual(sendChatTime1 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeGreaterThanOrEqual(sendChatTime2);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeLessThanOrEqual(sendChatTime2 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].playerId).toStrictEqual(playerId);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].messageBody).toStrictEqual('I got everything I wanted');

      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
            playerName: 'peahead',
            timeSent: sendChatTime1
          },
          {
            messageBody: 'I got everything I wanted',
            playerId: playerId,
            playerName: 'peahead',
            timeSent: sendChatTime2
          }
        ]
      });
    });

    test('Sending a single message from multiple users', () => {
      sendChatHandler(playerId, 'I had a dream');
      const sendChatTime1 = Math.round(Date.now() / 1000);
      const player2Id: number = (playerJoinHelper(sessionId, 'doostin') as PlayerReturn).playerId;
      sendChatHandler(player2Id, 'I got everything I wanted');
      const sendChatTime2 = Math.round(Date.now() / 1000);

      expect((viewChatHandler(playerId) as MessageReturn).messages.length).toStrictEqual(2);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeGreaterThanOrEqual(sendChatTime1);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeLessThanOrEqual(sendChatTime1 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeGreaterThanOrEqual(sendChatTime2);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeLessThanOrEqual(sendChatTime2 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].playerId).toStrictEqual(player2Id);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].messageBody).toStrictEqual('I got everything I wanted');
    });

    test('Sending multiple messages from multiple users', () => {
      sendChatHandler(playerId, 'I had a dream');
      const sendChatTime1 = Math.round(Date.now() / 1000);
      const player2Id: number = (playerJoinHelper(sessionId, 'doostin') as PlayerReturn).playerId;
      sendChatHandler(player2Id, 'I got everything I wanted');
      const sendChatTime2 = Math.round(Date.now() / 1000);
      sendChatHandler(playerId, 'Not what youd think');
      const sendChatTime3 = Math.round(Date.now() / 1000);
      sendChatHandler(player2Id, 'And if Im being honest');
      const sendChatTime4 = Math.round(Date.now() / 1000);

      expect((viewChatHandler(playerId) as MessageReturn).messages.length).toStrictEqual(4);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeGreaterThanOrEqual(sendChatTime1);
      expect((viewChatHandler(playerId) as MessageReturn).messages[0].timeSent).toBeLessThanOrEqual(sendChatTime1 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeGreaterThanOrEqual(sendChatTime2);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].timeSent).toBeLessThanOrEqual(sendChatTime2 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[2].timeSent).toBeGreaterThanOrEqual(sendChatTime3);
      expect((viewChatHandler(playerId) as MessageReturn).messages[2].timeSent).toBeLessThanOrEqual(sendChatTime3 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[3].timeSent).toBeGreaterThanOrEqual(sendChatTime4);
      expect((viewChatHandler(playerId) as MessageReturn).messages[3].timeSent).toBeLessThanOrEqual(sendChatTime4 + timeBufferSeconds);
      expect((viewChatHandler(playerId) as MessageReturn).messages[1].playerId).toStrictEqual(player2Id);
      expect((viewChatHandler(playerId) as MessageReturn).messages[3].messageBody).toStrictEqual('And if Im being honest');
    });
  });
});
