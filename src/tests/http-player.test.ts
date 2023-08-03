import { AdminQuizCreate, Jwt, QuestionBody, Token, OkSessionObj, QuizQuestionCreate, PlayerReturn, QuizSession, getQuestionResultsReturn } from '../../interfaces/interfaces';
import { clearUsers, registerUser } from './iter2tests/testHelpersv1';
import { RequestCreateQuizV2, createQuizQuestionHandlerV2, startSessionQuiz, playerJoinHelper, updateQuizSessionStateHandler, getSessionStatusHandler, playerQuestionInfoHelper, playerSubmitAnswerHandler, getQuestionResultsHandler } from './testhelpersV2';
import { tokenToJwt } from '../token';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
jest.setTimeout(20000);
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
  let defaultQuestionBody1 : QuestionBody;
  let defaultQuestionBody2 : QuestionBody;
  let sessionId: OkSessionObj;
  let playerId: PlayerReturn;
  let questionId1: QuizQuestionCreate;

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
    defaultQuestionBody1 = {
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
    questionId1 = createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody1) as QuizQuestionCreate;
    createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody2) as QuizQuestionCreate;
    sessionId = startSessionQuiz(userJwt, 30, quizId) as OkSessionObj;
    playerId = playerJoinHelper(sessionId.sessionId, 'John Doe') as PlayerReturn;
  });
  describe('Unsuccessful ', () => {
    test('PlayerId does not exist', () => {
      expect(playerQuestionInfoHelper(playerId.playerId + 1, 1)).toStrictEqual({
        error: 'player ID does not exist'
      });
    });

    test('Question position is not valid for the session this player is in', () => {
      expect(playerQuestionInfoHelper(playerId.playerId, 10)).toStrictEqual({
        error: 'Question position is not valid for the session this player is in'
      });
    });

    test('If session is not currently on this question', async () => {
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      expect(playerQuestionInfoHelper(playerId.playerId, 2)).toStrictEqual({
        error: 'Session is not currently on this question'
      });
    });

    test('Session is in LOBBY or END state', () => {
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'LOBBY');
      expect(playerQuestionInfoHelper(playerId.playerId, 1)).toStrictEqual({
        error: 'Session is in LOBBY or END state'
      });
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'END');
      expect(playerQuestionInfoHelper(playerId.playerId, 1)).toStrictEqual({
        error: 'Session is in LOBBY or END state'
      });
    });
  });

  describe('Successful', () => {
    test('Success', async () => {
      updateQuizSessionStateHandler(quizId, sessionId.sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      expect(playerQuestionInfoHelper(playerId.playerId, 1)).toEqual(
        {
          questionId: questionId1.questionId,
          question: 'What content is Russia in?',
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

//  GET QUESTION RESULTS TESTS //
describe('getQuestionResults', () => {
  let userJwt: Jwt;
  let userToken: Token;
  let quizId: number;
  let defaultQuestionBody1 : QuestionBody;
  let defaultQuestionBody2 : QuestionBody;
  let sessionId: number;
  let playerId: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);

    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    defaultQuestionBody2 = {
      question: 'What content is Japan in?',
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
          answer: 'continent of Asia',
          colour: 'Blue',
          correct: true
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
    defaultQuestionBody1 = {
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
      ],
      thumbnailUrl: 'https://static.vecteezy.com/system/resources/previews/001/204/011/original/soccer-ball-png.png'
    };
    createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody1) as QuizQuestionCreate;
    createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody2) as QuizQuestionCreate;
    sessionId = (startSessionQuiz(userJwt, 30, quizId) as OkSessionObj).sessionId;
    playerId = (playerJoinHelper(sessionId, 'John Doe') as PlayerReturn).playerId;
  });
  describe('Unsuccessful ', () => {
    test('PlayerId does not exist', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      playerSubmitAnswerHandler([0], playerId, 1);
      await delay(1100);
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');
      expect(getQuestionResultsHandler(-99, 1)).toStrictEqual({
        error: 'player ID does not exist'
      });
    });

    test('Question position is not valid for the session this player is in', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      playerSubmitAnswerHandler([0], playerId, 1);
      await delay(1100);
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');
      expect(getQuestionResultsHandler(playerId, 10)).toStrictEqual({
        error: 'Question position is not valid for the session this player is in'
      });
    });

    test('If session is not currently on this question', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      playerSubmitAnswerHandler([0], playerId, 1);
      await delay(1100);
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');
      expect(getQuestionResultsHandler(playerId, 2)).toStrictEqual({
        error: 'Session is not yet currently up to this question'
      });
    });

    test('Session is in LOBBY or END state', () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'LOBBY');
      expect(getQuestionResultsHandler(playerId, 1)).toStrictEqual({
        error: 'The question is not open for results'
      });
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END');
      expect(getQuestionResultsHandler(playerId, 1)).toStrictEqual({
        error: 'The question is not open for results'
      });
    });
  });
});

//  PLAYER SUBMIT ANSWER TESTS & GET QUESTION RESULTS //
describe('playerSubmistAnswer', () => {
  let userJwt: Jwt;
  let userToken: Token;
  let quizId: number;
  let defaultQuestionBody1 : QuestionBody;
  let defaultQuestionBody2 : QuestionBody;
  let sessionId: number;
  let playerId: number;
  let playerId2: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);

    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    defaultQuestionBody2 = {
      question: 'What content is Japan in?',
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
          answer: 'continent of Asia',
          colour: 'Blue',
          correct: true
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
    defaultQuestionBody1 = {
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
      ],
      thumbnailUrl: 'https://static.vecteezy.com/system/resources/previews/001/204/011/original/soccer-ball-png.png'
    };
    createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody1) as QuizQuestionCreate;
    createQuizQuestionHandlerV2(quizId, userJwt, defaultQuestionBody2) as QuizQuestionCreate;
    sessionId = (startSessionQuiz(userJwt, 30, quizId) as OkSessionObj).sessionId;
    playerId = (playerJoinHelper(sessionId, 'John Doe') as PlayerReturn).playerId;
    playerId2 = (playerJoinHelper(sessionId, 'Titus Cha') as PlayerReturn).playerId;
  });
  describe('Unsuccessful ', () => {
    test('PlayerId does not exist', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      // Now state is QUESTION_OPEN
      expect(playerSubmitAnswerHandler([0], -99, 0)).toStrictEqual({
        error: 'player ID does not exist'
      });
    });

    test('Question position is not valid for the session this player is in', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      expect(playerSubmitAnswerHandler([0], playerId, 20)).toStrictEqual({
        error: 'Question position is not valid for the session this player is in'
      });
    });

    test('If session is not currently on this question', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      expect(playerSubmitAnswerHandler([0], playerId, 2)).toStrictEqual({
        error: 'Session is not yet currently up to this question'
      });
    });

    test('invalid answer Ids', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      expect(playerSubmitAnswerHandler([-99, 80], playerId, 1)).toStrictEqual({
        error: 'Answer IDs are not valid for this particular question'
      });
    });

    test('duplicate answer Ids', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      expect(playerSubmitAnswerHandler([0, 0], playerId, 1)).toStrictEqual({
        error: 'Duplicate Answers not allowed'
      });
    });

    test('Session is in LOBBY or END state', () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'LOBBY');
      expect(playerSubmitAnswerHandler([0], playerId, 1)).toStrictEqual({
        error: 'The question is not open for answers'
      });
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END');
      expect(playerSubmitAnswerHandler([0], playerId, 1)).toStrictEqual({
        error: 'The question is not open for answers'
      });
    });
  });

  describe('Successful', () => {
    test('Success 1 round', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1000);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(700); // submission time after question opens
      expect(playerSubmitAnswerHandler([0], playerId, 1)).toStrictEqual({

      });
      await delay(800);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      // expect(getQuestionResultsHandler(playerId, 1)).toEqual({
      //   questionId: 0,
      //   questionCorrectBreakdown: [
      //     {
      //       answerId: 0,
      //       playersCorrect: [
      //         'John Doe',
      //       ]
      //     }
      //   ],
      //   averageAnswerTime: 1,
      //   percentCorrect: 100
      // });
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).questionId).toEqual(0);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).questionCorrectBreakdown).toEqual([
        {
          answerId: 0,
          playersCorrect: [
            'John Doe',
          ]
        }
      ]);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).averageAnswerTime).toBeLessThanOrEqual(1);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).percentCorrect).toEqual(100);
    });

    test('Success 2 round & successful multiple correct answers', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      playerSubmitAnswerHandler([0], playerId, 1);
      await delay(1100);
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');

      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1000);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(500);
      expect(playerSubmitAnswerHandler([0, 1], playerId, 2)).toStrictEqual({

      });
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      // expect(getQuestionResultsHandler(playerId, 2)).toEqual({
      //   questionId: 1,
      //   questionCorrectBreakdown: [
      //     {
      //       answerId: 0,
      //       playersCorrect: [
      //         'John Doe',
      //       ]
      //     },
      //     {
      //       answerId: 1,
      //       playersCorrect: [
      //         'John Doe',
      //       ]
      //     }
      //   ],
      //   averageAnswerTime: 1,
      //   percentCorrect: 100
      // });
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).questionId).toEqual(1);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).questionCorrectBreakdown).toEqual([
        {
          answerId: 0,
          playersCorrect: [
            'John Doe',
          ]
        },
        {
          answerId: 1,
          playersCorrect: [
            'John Doe',
          ]
        }
      ]);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).averageAnswerTime).toBeLessThanOrEqual(1);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).percentCorrect).toEqual(100);
    });

    test('Success 2 rounds of incorrect answers', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1000);
      await delay(400);
      playerSubmitAnswerHandler([3], playerId, 1);
      await delay(1100);
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');

      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      expect(playerSubmitAnswerHandler([0, 3], playerId, 2)).toStrictEqual({

      });
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      // expect(getQuestionResultsHandler(playerId, 1)).toEqual({
      //   questionId: 0,
      //   questionCorrectBreakdown: [
      //     {
      //       answerId: 0,
      //       playersCorrect: [

      //       ]
      //     },
      //   ],
      //   averageAnswerTime: 0,
      //   percentCorrect: 0
      // });
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).questionId).toEqual(0);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).questionCorrectBreakdown).toEqual([
        {
          answerId: 0,
          playersCorrect: [

          ]
        }
      ]);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).averageAnswerTime).toBeLessThanOrEqual(1);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).percentCorrect).toEqual(0);
      // expect(getQuestionResultsHandler(playerId, 2)).toEqual({
      //   questionId: 1,
      //   questionCorrectBreakdown: [
      //     {
      //       answerId: 0,
      //       playersCorrect: [

      //       ]
      //     },
      //     {
      //       answerId: 1,
      //       playersCorrect: [

      //       ]
      //     },
      //   ],
      //   averageAnswerTime: 1,
      //   percentCorrect: 0
      // });
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).questionId).toEqual(1);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).questionCorrectBreakdown).toEqual([
        {
          answerId: 0,
          playersCorrect: [

          ]
        },
        {
          answerId: 1,
          playersCorrect: [

          ]
        }
      ]);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).averageAnswerTime).toBeLessThanOrEqual(1);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).percentCorrect).toEqual(0);
    });

    test('Success 1 correct, 1 incorrect', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1000);
      await delay(800);
      playerSubmitAnswerHandler([0], playerId, 1);
      await delay(1100);
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');

      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(700);
      expect(playerSubmitAnswerHandler([1, 2], playerId, 2)).toStrictEqual({

      });
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      // expect(getQuestionResultsHandler(playerId, 1)).toEqual({
      //   questionId: 0,
      //   questionCorrectBreakdown: [
      //     {
      //       answerId: 0,
      //       playersCorrect: [
      //         'John Doe',
      //       ]
      //     },
      //   ],
      //   averageAnswerTime: 1,
      //   percentCorrect: 100
      // });
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).questionId).toEqual(0);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).questionCorrectBreakdown).toEqual([
        {
          answerId: 0,
          playersCorrect: [
            'John Doe',
          ]
        }
      ]);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).averageAnswerTime).toBeLessThanOrEqual(1);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).percentCorrect).toEqual(100);
      // expect(getQuestionResultsHandler(playerId, 2)).toEqual({
      //   questionId: 1,
      //   questionCorrectBreakdown: [
      //     {
      //       answerId: 0,
      //       playersCorrect: [

      //       ]
      //     },
      //     {
      //       answerId: 1,
      //       playersCorrect: [

      //       ]
      //     },
      //   ],
      //   averageAnswerTime: 1,
      //   percentCorrect: 0
      // });
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).questionId).toEqual(1);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).questionCorrectBreakdown).toEqual([
        {
          answerId: 0,
          playersCorrect: [

          ]
        },
        {
          answerId: 1,
          playersCorrect: [

          ]
        }
      ]);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).averageAnswerTime).toBeLessThanOrEqual(1);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).percentCorrect).toEqual(0);
    });
    test('More complex, 2 players play through quiz', async () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1000);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(300);
      playerSubmitAnswerHandler([1, 3], playerId, 1);
      await delay(200);
      playerSubmitAnswerHandler([0], playerId2, 1);
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');
      // expect(getQuestionResultsHandler(playerId, 1)).toEqual({
      //   questionId: 0,
      //   questionCorrectBreakdown: [
      //     {
      //       answerId: 0,
      //       playersCorrect: [
      //         'Titus Cha',
      //       ]
      //     },
      //   ],
      //   averageAnswerTime: 1,
      //   percentCorrect: 50
      // });
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).questionId).toEqual(0);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).questionCorrectBreakdown).toEqual([
        {
          answerId: 0,
          playersCorrect: [
            'Titus Cha',
          ]
        },
      ]);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).averageAnswerTime).toBeLessThanOrEqual(1);
      expect((getQuestionResultsHandler(playerId, 1) as getQuestionResultsReturn).percentCorrect).toEqual(50);
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(1000);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(500);
      playerSubmitAnswerHandler([0, 3], playerId2, 2);
      await delay(200);
      playerSubmitAnswerHandler([0, 1], playerId, 2);
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER');
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      // expect(getQuestionResultsHandler(playerId, 2)).toEqual({
      //   questionId: 1,
      //   questionCorrectBreakdown: [
      //     {
      //       answerId: 0,
      //       playersCorrect: [
      //         'John Doe',
      //       ]
      //     },
      //     {
      //       answerId: 1,
      //       playersCorrect: [
      //         'John Doe',
      //       ]
      //     },
      //   ],
      //   averageAnswerTime: 1,
      //   percentCorrect: 50
      // });
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).questionId).toEqual(1);
      expect((getQuestionResultsHandler(playerId2, 2) as getQuestionResultsReturn).questionCorrectBreakdown).toEqual([
        {
          answerId: 0,
          playersCorrect: [
            'John Doe',
          ]
        },
        {
          answerId: 1,
          playersCorrect: [
            'John Doe',
          ]
        }
      ]);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).averageAnswerTime).toBeLessThanOrEqual(1);
      expect((getQuestionResultsHandler(playerId, 2) as getQuestionResultsReturn).percentCorrect).toEqual(50);
    });
  });
});

describe('TESTs for getSessionResults', () => {
  describe('Unsuccessful tests', () => {
    test('player ID does not ');
  });
});
