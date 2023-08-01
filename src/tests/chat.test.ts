import { AdminQuizCreate, Message, MessageReturn, PlayerReturn, QuizSession, QuizSessionAdmin, Token, Jwt, PlayerQuestionInfoReturn, OkSessionObj } from "../../interfaces/interfaces";
import { viewChatHandler, pushChatForViewChatHandler, startSessionQuiz } from "./testhelpersV2";
import { playerJoinHelper, RequestCreateQuizV2 } from "./testhelpersV2";
import { clearUsers, loginUser, registerUser } from './iter2tests/testHelpersv1';
import { jwtToToken, tokenToJwt } from "../token";

beforeEach(() => {
  clearUsers();
});
  
afterEach(() => {
  clearUsers();
});

const defaultQuestionBody = {
  question: 'What content is Russia in?',
  duration: 1,
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
  ]
};

describe('Tests for viewChat', () => {
  let sessionId: number;
  let playerId: number = 10;
  let player: PlayerReturn;
  let quizId: number;
  beforeEach(() => {
    const token = registerUser('good@email.com', 'Password123', 'Mount', 'Franklin') as Token;
    const quizId = (RequestCreateQuizV2(tokenToJwt(token), 'Continents of the World', 'continent quiz') as AdminQuizCreate).quizId;
    sessionId = (startSessionQuiz(tokenToJwt(token), 30, quizId) as OkSessionObj).sessionId;
    player = playerJoinHelper(sessionId, 'pea head') as PlayerReturn;
    playerId = player.playerId;   
  });

  describe('Unsuccessful Attempts', () => {
    test('playerId does not exist', () => {
      expect(playerId).toStrictEqual({ error: 'Player ID is not valid' });
    });
});

  describe('Successful Attempts', () => {
    test('view messages when chat is empty', () => {
      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: []
      });
    });
    test('view single message', () => {
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
    test('view multiple messages from the same player', () => {
      pushChatForViewChatHandler(playerId, sessionId, 'I had a dream');
      pushChatForViewChatHandler(playerId, sessionId, 'That my head was underwater');
      expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
          },
        ]
      });
    });
    test('view messages from multiple players', () => {
      const player2Id = playerJoinHelper(sessionId, 'doostin') as PlayerReturn;
      //pushChatForViewChatHandler(playerId, sessionId, 'I had a dream');
      //pushChatForViewChatHandler(player2Id, sessionId, 'That my head was underwater');
      /*expect(viewChatHandler(playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'I had a dream',
            playerId: playerId,
          },
          {
            messageBody: 'That my head was underwater',
            playerId: player2Id,
          }
        ]
      });*/
    });
  });
})