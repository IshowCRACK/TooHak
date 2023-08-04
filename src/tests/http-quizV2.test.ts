import { ErrorObj, Token, AdminQuizCreate, Jwt, OkObj, AdminQuizInfo, OkSessionObj, QuizSession, QuizQuestionCreate, PlayerReturn, QuestionBody } from '../../interfaces/interfaces';
import { tokenToJwt } from '../token';
import { registerUser, clearUsers, createQuizQuestionHandler } from './iter2tests/testHelpersv1';
import {
  RequestCreateQuizV2, RequestRemoveQuizV2, infoQuizV2, listQuizV2, logoutUserHandlerV2, startSessionQuiz, updateNameQuizV2,
  createQuizThumbnailHandler, updateQuizSessionStateHandler, getSessionStatusHandler, updateDescriptionQuizV2, viewQuizTrashHandlerV2,
  trashRestoreQuizHandlerV2, emptyTrashHandlerV2, quizTransferHandlerV2, createQuizQuestionHandlerV2, playerJoinHelper, getFinalQuizResultsHandler, playerSubmitAnswerHandler
} from './testhelpersV2';

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

const defaultQuestionBody2 = {
  question: 'What country is sydney in?',
  duration: 1,
  points: 1,
  answers: [
    {
      answerId: 0,
      answer: 'Australia',
      colour: 'Red',
      correct: true
    },
    {
      answerId: 1,
      answer: 'Earth',
      colour: 'Blue',
      correct: false
    },
    {
      answerId: 2,
      answer: 'Russia',
      colour: 'Green',
      correct: false
    },
    {
      answerId: 3,
      answer: 'Ukraine',
      colour: 'Yellow',
      correct: false
    }
  ]
};
//  ///////////////////// NEW ITR3  ////////////////////////////////////////////

// TESTS FOR QUIZ GET QUIZ SESSION STATUS //
describe('SEssion get status', () => {
  let userJwt: Jwt;
  let userJwt2: Jwt;
  let userJwt3: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let userToken3: Token;

  let quizId: number;
  let sessionId: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    createQuizThumbnailHandler(userJwt, quizId, 'https://thumbs.dreamstime.com/z/tracks-snow-3356163.jpg');
    createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody);
    createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody2);

    sessionId = (startSessionQuiz(userJwt, 30, quizId) as OkSessionObj).sessionId;

    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
    userJwt2 = tokenToJwt(userToken2);

    userToken3 = registerUser('JaneAusdfdsfsdfdddsten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
    userJwt3 = tokenToJwt(userToken3);
    logoutUserHandlerV2(tokenToJwt(userToken3));
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Unsucessful cases', () => {
    test('Quiz ID does not refer to a valid quiz', () => {
      expect(getSessionStatusHandler(-99, sessionId, userJwt)).toEqual(
        { error: 'Quiz ID does not refer to a valid quiz' }
      );
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      expect(getSessionStatusHandler(quizId, sessionId, userJwt2)).toEqual(
        { error: 'Quiz ID does not refer to a quiz that this user owns' }
      );
    });

    test('Not token of an active session', () => {
      expect(getSessionStatusHandler(quizId, sessionId, userJwt3)).toStrictEqual(
        { error: 'Token not for currently logged in session' }
      );
    });

    test('Token is not a valid structure', () => {
      expect(getSessionStatusHandler(quizId, sessionId, { token: '-1' })).toEqual(
        { error: 'Token is not a valid structure' }
      );
    });

    test('Invalid Session', () => {
      expect(getSessionStatusHandler(quizId, -99, userJwt)).toEqual(
        { error: 'Invalid quiz session or session not found' }
      );
    });
  });

  describe('Successful cases', () => {
    test('Successful get session status ', () => {
      expect(getSessionStatusHandler(quizId, sessionId, userJwt)).toEqual({
        state: 'LOBBY',
        atQuestion: 0,
        players: [],
        metadata: {
          quizId: (infoQuizV2(userJwt, quizId) as AdminQuizInfo).quizId,
          name: (infoQuizV2(userJwt, quizId) as AdminQuizInfo).name,
          timeCreated: (infoQuizV2(userJwt, quizId) as AdminQuizInfo).timeCreated,
          timeLastEdited: (infoQuizV2(userJwt, quizId) as AdminQuizInfo).timeLastEdited,
          description: (infoQuizV2(userJwt, quizId) as AdminQuizInfo).description,
          numQuestions: (infoQuizV2(userJwt, quizId) as AdminQuizInfo).numQuestions,
          questions: (infoQuizV2(userJwt, quizId) as AdminQuizInfo).questions,
          imgUrl: 'https://thumbs.dreamstime.com/z/tracks-snow-3356163.jpg',
          duration: (infoQuizV2(userJwt, quizId) as AdminQuizInfo).duration,
        },
      });
    });
  });
});

// TESTS FOR QUIZ SESSION UPDATE STATE //
describe('Session State Update', () => {
  let userJwt: Jwt;
  let userJwt2: Jwt;
  let userJwt3: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let userToken3: Token;

  let quizId: number;
  let sessionId: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody);
    createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody2);

    sessionId = (startSessionQuiz(userJwt, 30, quizId) as OkSessionObj).sessionId;

    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
    userJwt2 = tokenToJwt(userToken2);

    userToken3 = registerUser('JaneAusdfdsfsdfdddsten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
    userJwt3 = tokenToJwt(userToken3);
    logoutUserHandlerV2(tokenToJwt(userToken3));
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Unsucessful cases', () => {
    test('Quiz ID does not refer to a valid quiz', () => {
      expect(updateQuizSessionStateHandler(-99, sessionId, userJwt, 'QUESTION_COUNTDOWN')).toEqual(
        { error: 'Quiz ID does not refer to a valid quiz' }
      );
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt2, 'QUESTION_COUNTDOWN')).toEqual(
        { error: 'Quiz ID does not refer to a quiz that this user owns' }
      );
    });

    test('Not token of an active session', () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt3, 'QUESTION_COUNTDOWN')).toStrictEqual(
        { error: 'Token not for currently logged in session' }
      );
    });

    test('Token is not a valid structure', () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, { token: '-1' }, 'QUESTION_COUNTDOWN')).toEqual(
        { error: 'Token is not a valid structure' }
      );
    });

    test('Invalid Session', () => {
      expect(updateQuizSessionStateHandler(quizId, -99, userJwt, 'QUESTION_COUNTDOWN')).toEqual(
        { error: 'Invalid quiz session or session not found' }
      );
    });

    test('Invalid Action Enum', () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'INVALID_ACTION')).toEqual(
        { error: 'Invalid action. Action must be one of the valid action strings.' }
      );
    });

    test('Action CANNOT be applied to current state', () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_FINAL_RESULTS')).toEqual(
        { error: 'Action CANNOT be applied to current state' }
      );
    });
    test('Action CANNOT be applied to current state', () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_FINAL_RESULTS')).toEqual(
        { error: 'Action CANNOT be applied to current state' }
      );
    });
    test('Action CANNOT be applied to current state', () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER')).toEqual(
        { error: 'Action CANNOT be applied to current state' }
      );
    });
  });

  describe('Successful cases', () => {
    test('LOBBY ---> END', () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END')).toEqual({
      });
    });

    test('LOBBY ---> QUESTION_COUNTDOWN ---> END', async () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('END');
    });

    test('LOBBY ---> QUESTION_COUNTDOWN --(countdown duration)--> QUESTION_OPEN --(question duration)--> QUESTION_CLOSE ---> ANSWERSHOW ---> FINAL RESULTS ---> END ', async () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_FINAL_RESULTS')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('FINAL_RESULTS');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('END');
    });

    test('LOBBY ---> QUESTION_COUNTDOWN --(countdown duration)--> QUESTION_OPEN --(question duration)--> QUESTION_CLOSE ---> FINAL RESULTS ---> END ', async () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_FINAL_RESULTS')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('FINAL_RESULTS');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('END');
    });

    test('LOBBY ---> QUESTION_COUNTDOWN --(countdown duration)--> QUESTION_OPEN --(question duration)--> QUESTION_CLOSE  ---> END ', async () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('END');
    });

    test('LOBBY ---> QUESTION_COUNTDOWN --(countdown duration)--> QUESTION_OPEN --(question duration)--> QUESTION_CLOSE  ---> QUESTION_COUNTDOWN ---> QUESTION_OPEN ---> ANSWER_SHOW --(END state is set eventhough NEXT_QUESTION is called to test last question case)--> END', async () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('END');
    });
    test('LOBBY ---> QUESTION_COUNTDOWN --(countdown duration)--> QUESTION_OPEN ---> END ', async () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('END');
    });
    test('LOBBY ---> QUESTION_COUNTDOWN --(countdown duration)--> QUESTION_OPEN ---> ANSWERSHOW ---> END ', async () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(1100);
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('END');
    });

    test('LOBBY ---> QUESTION_COUNTDOWN --(countdown duration)--> QUESTION_OPEN ---> ANSWERSHOW ---> QUESTION_COUNTDOWN ---> END  ', async () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('END');
    });

    test('LOBBY ---> QUESTION_COUNTDOWN --(countdown duration)--> QUESTION_OPEN --(question duration)--> QUESTION_CLOSE ---> ANSWER_SHOW ---> QUESTION_COUNTDOWN ---> QUESTION_OPEN ---> ANSWER_SHOW --(END state is set eventhough NEXT_QUESTION is called to test last question case)--> END', async () => {
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);

      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_CLOSE');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_COUNTDOWN');
      await delay(1100);
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('QUESTION_OPEN');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'GO_TO_ANSWER')).toEqual({
      });
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('ANSWER_SHOW');
      expect(updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION')).toEqual({
      });
      // Expect STATE to be END because last question (extra edge case i added)
      expect((getSessionStatusHandler(quizId, sessionId, userJwt) as QuizSession).state).toEqual('END');
    });
  });
});

// TESTS FOR QUIZ THUMBNAIL //
describe('Quiz Thumnail', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: number;
  let quizId1: number;
  let quizId2: number;
  let res: OkObj | ErrorObj;
  let res0: OkObj | ErrorObj;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    quizId0 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuizV2(tokenToJwt(token1), 'Quiz2', 'Description 2') as AdminQuizCreate).quizId;
    logoutUserHandlerV2(tokenToJwt(token1));
  });
  describe('Successful Tests', () => {
    test('successful image upload', () => {
      res = createQuizThumbnailHandler(tokenToJwt(token0), quizId0, 'https://thumbs.dreamstime.com/z/tracks-snow-3356163.jpg');
      expect(res).toStrictEqual({});
    });

    test('2. Successfull Quiz thumbnail multiple for User', () => {
      res = createQuizThumbnailHandler(tokenToJwt(token0), quizId0, 'https://thumbs.dreamstime.com/z/tracks-snow-3356163.jpg');
      res0 = createQuizThumbnailHandler(tokenToJwt(token0), quizId1, 'http://www.freeimageslive.co.uk/files/images006/christmas_balls.jpg');
      expect(res).toStrictEqual({

      });
      expect(res0).toStrictEqual({

      });
    });
  });

  describe('Unsuccessful Tests', () => {
    // test('Not token of an active session', () => {
    //   res = createQuizThumbnailHandler(tokenToJwt(token1), quizId1, 'https://png.pngtree.com/png-clipart/20210318/ourmid/pngtree-delicious-pancakes-for-canadian-maple-festival-png-image_3045828.jpg');
    //   expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    // });

    test('Invalid QuizId ', () => {
      res = createQuizThumbnailHandler(tokenToJwt(token0), -99, 'https://thumbs.dreamstime.com/z/tracks-snow-3356163.jpg');
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      res = createQuizThumbnailHandler(tokenToJwt(token0), quizId2, 'https://thumbs.dreamstime.com/z/tracks-snow-3356163.jpg');
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('imgUrl when fetched does not return a valid file', () => {
      res = createQuizThumbnailHandler(tokenToJwt(token0), quizId1, 'https://github.com/BhanukaUOM/valid-image-url');
      expect(res).toStrictEqual({ error: 'imgUrl must be a valid file URL' });
    });

    test('imgUrl when fetched does not return a valid file', () => {
      res = createQuizThumbnailHandler(tokenToJwt(token0), quizId1, 'https://definately NOT avalidURL');
      expect(res).toStrictEqual({ error: 'imgUrl must be a valid file URL' });
    });
  });
});

//  ///////////////////// MODIFIED ITR3 ////////////////////////////////////////

// TESTS FOR QUIZ CREATE //
describe('Quiz CreateV2', () => {
  let token0: Token;
  let token1: Token;
  let res: AdminQuizCreate | ErrorObj;
  let res0: AdminQuizCreate | ErrorObj;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    logoutUserHandlerV2(tokenToJwt(token1));
  });
  describe('Successful Tests', () => {
    test('1. Successfull Quiz Create for User', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ quizId: 0 });
    });

    test('2. Successfull Quiz Create multiple for User', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description0');
      res0 = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz1', 'Description0');
      expect(res).toStrictEqual({ quizId: 0 });
      expect(res0).toStrictEqual({ quizId: 1 });
    });
  });

  describe('Unsuccessful Tests', () => {
    test('3. Not token of an active session', () => {
      res = RequestCreateQuizV2(tokenToJwt(token1), 'Quiz1', 'Description1');
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Invalid Name ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), '', 'Description0');
      expect(res).toStrictEqual({ error: 'A name must be entered' });
    });

    test('5. Invalid Name ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), '12', 'Description0');
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('6. Invalid Name ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), 'abcde12345abcde12345abcde12345sdf', 'Description0');
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('7. Non Alphanumeric ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), '(*#&$*@#($()@#$', 'Description0');
      expect(res).toStrictEqual({ error: 'Must use only alphanumeric characters or spaces in name' });
    });

    test('8. Invalid Description ', () => {
      res = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', '12345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910343142432dfasdf');
      expect(res).toStrictEqual({ error: 'Description must be under 100 characters' });
    });

    test('10. Name already used', () => {
      RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description0');
      res = RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description0');
      expect(res).toStrictEqual({ error: 'Quiz name is already in use' });
    });
  });
});

// TESTS FOR QUIZ LIST //
describe('adminQuizListV2 tests', () => {
  let jwt: Jwt;
  beforeEach(() => {
    const token = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    jwt = tokenToJwt(token);
  });

  describe('Unsuccessful test', () => {
    test('Invalid user', () => {
      const token: Token = {
        sessionId: '',
        userId: 1
      };
      expect(listQuizV2(tokenToJwt(token))).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });

  describe('Successful tests', () => {
    test('User with no owned quizzes', () => {
      expect(listQuizV2(jwt)).toStrictEqual({ quizzes: [] });
    });

    test('User with one owned quizzes', () => {
      RequestCreateQuizV2(jwt, 'Countries of the world', 'Quiz on all countries');
      expect(listQuizV2(jwt)).toStrictEqual({ quizzes: [{ quizId: 0, name: 'Countries of the world' }] });
    });

    test('User with multiple owned quizzes', () => {
      RequestCreateQuizV2(jwt, 'Countries of the world', 'Quiz on all countries');
      RequestCreateQuizV2(jwt, 'Flags of the world', 'Quiz on all flags');
      expect(listQuizV2(jwt)).toStrictEqual({ quizzes: [{ quizId: 0, name: 'Countries of the world' }, { quizId: 1, name: 'Flags of the world' }] });
    });
  });
});
// TESTS FOR QUIZ REMOVE //
describe('Quiz RemoveV2', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: number;
  let quizId1: number;
  let quizId2: number;
  let res: OkObj | ErrorObj;
  let res0: OkObj | ErrorObj;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    quizId0 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuizV2(tokenToJwt(token1), 'Quiz2', 'Description 2') as AdminQuizCreate).quizId;
    logoutUserHandlerV2(tokenToJwt(token1));
  });
  describe('Successful Tests', () => {
    test('1. Successful Quiz Remove for User', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token0), quizId0);
      expect(res).toStrictEqual({

      });
    });

    test('2. Successfull Quiz Create multiple for User', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token0), quizId0);
      res0 = RequestRemoveQuizV2(tokenToJwt(token0), quizId1);
      expect(res).toStrictEqual({

      });
      expect(res0).toStrictEqual({

      });
    });
  });

  describe('Unsuccessful Tests', () => {
    test('3. Not token of an active session', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token1), quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Invalid QuizId ', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token0), -99);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('5. Quiz ID does not refer to a quiz that this user owns', () => {
      res = RequestRemoveQuizV2(tokenToJwt(token0), quizId2);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
  });
});

// TESTS FOR QUIZ INFO //
describe('Quiz InfoV2', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: number;
  let quizId1: number;
  let quizId2: number;
  let res: AdminQuizInfo | ErrorObj;
  let res0: AdminQuizInfo | ErrorObj;
  //  Giving a 20 second buffer for tests to run
  const timeBufferSeconds = 20;
  let quizCreationTime: number;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    quizId0 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuizV2(tokenToJwt(token1), 'Quiz2', 'Description 2') as AdminQuizCreate).quizId;
    logoutUserHandlerV2(tokenToJwt(token1));
  });

  describe('Successful tests', () => {
    beforeEach(() => {
      quizCreationTime = Math.round(Date.now() / 1000);
    });

    test('1. valid token and quizId for 1 owned quiz', () => {
      res = infoQuizV2(tokenToJwt(token0), quizId0) as AdminQuizInfo;
      expect(res).toEqual(
        expect.objectContaining({
          quizId: quizId0,
          name: 'Quiz0',
          description: 'Description 0',
          numQuestions: 0,
          questions: [],
          duration: 0
        })
      );

      expect(res.timeCreated).toBeLessThanOrEqual(quizCreationTime);
      expect(res.timeCreated).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
      expect(res.timeLastEdited).toBeLessThanOrEqual(quizCreationTime);
      expect(res.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
    });

    test('2. valid token and quizId for multiple owned quiz', () => {
      res = infoQuizV2(tokenToJwt(token0), quizId0) as AdminQuizInfo;
      res0 = infoQuizV2(tokenToJwt(token0), quizId1) as AdminQuizInfo;

      expect(res).toEqual(
        expect.objectContaining({
          quizId: quizId0,
          name: 'Quiz0',
          description: 'Description 0',
          numQuestions: 0,
          questions: [],
          duration: 0
        })
      );

      expect(res.timeCreated).toBeLessThanOrEqual(quizCreationTime);
      expect(res.timeCreated).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
      expect(res.timeLastEdited).toBeLessThanOrEqual(quizCreationTime);
      expect(res.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);

      expect(res0).toEqual(
        expect.objectContaining({
          quizId: quizId1,
          name: 'Quiz1',
          description: 'Description 1',
          numQuestions: 0,
          questions: [],
          duration: 0
        })
      );

      expect(res0.timeCreated).toBeLessThanOrEqual(quizCreationTime);
      expect(res0.timeCreated).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
      expect(res0.timeLastEdited).toBeLessThanOrEqual(quizCreationTime);
      expect(res0.timeLastEdited).toBeGreaterThanOrEqual(quizCreationTime - timeBufferSeconds);
    });
  });

  describe('Unsuccessful tests', () => {
    test('1 Invalid QuizId ', () => {
      res = infoQuizV2(tokenToJwt(token0), -99);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('2. Quiz ID does not refer to a quiz that this user owns', () => {
      res = infoQuizV2(tokenToJwt(token0), quizId2);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
    test('3. Not token of an active session', () => {
      res = infoQuizV2(tokenToJwt(token1), quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });

    test('4. Token is not a valid structure', () => {
      res = infoQuizV2({ token: '-1' }, quizId1);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });
  });
});

// TESTS FOR QUIZ UPDATE NAME //
describe('Quiz Update NameV2', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: number;
  let quizId1: number;
  let res: OkObj | ErrorObj;
  let quizInfo: AdminQuizInfo;

  //  Giving a 20 second buffer for tests to run
  const timeBufferSeconds = 20;
  let quizEditedTime: number;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    quizId0 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuizV2(tokenToJwt(token1), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
  });
  describe('Successful test', () => {
    beforeEach(() => {
      quizEditedTime = Math.round(Date.now() / 1000);
      res = updateNameQuizV2(tokenToJwt(token0), 'Quiz 0 Updated', quizId0) as OkObj;
      quizInfo = infoQuizV2(tokenToJwt(token0), quizId0) as AdminQuizInfo;
    });

    test('1. Updates the name of an existing quiz', () => {
      expect(quizInfo.name).toStrictEqual('Quiz 0 Updated');
      expect(res).toStrictEqual({});
    });

    test('2. Updates the time edited', () => {
      expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime);
      expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime + timeBufferSeconds);
      expect(res).toEqual({});
    });
  });

  describe('Unsuccessful test', () => {
    test('1. Returns an error when Quiz ID does not refer to a valid quiz', () => {
      res = updateNameQuizV2(tokenToJwt(token0), 'Quiz 0 Updated', -9);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('2. Quiz ID does not refer to a quiz that this user owns', () => {
      res = updateNameQuizV2(tokenToJwt(token0), 'Quiz 1 Updated', quizId1);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('3. Non alphanumeric name entered', () => {
      res = updateNameQuizV2(tokenToJwt(token0), '~ Quiz 0 Updated ~', quizId0);
      expect(res).toStrictEqual({ error: 'Must use only alphanumeric characters or spaces in name' });
    });

    test('4. Less than 3 characters', () => {
      res = updateNameQuizV2(tokenToJwt(token0), 'hi', quizId0);
      expect(res).toStrictEqual({ error: 'Name must be between 3 and 30 characters' });
    });

    test('5. More than 30 characters', () => {
      res = updateNameQuizV2(tokenToJwt(token0), 'abcdefghijklmnopqrstuvwxyz12345', quizId0);
      expect(res).toStrictEqual(
        { error: 'Name must be between 3 and 30 characters' });
    });

    test('6. Name already used by same user', () => {
      updateNameQuizV2(tokenToJwt(token0), 'Quiz 0 Updated', quizId0);
      res = updateNameQuizV2(tokenToJwt(token0), 'Quiz 0 Updated', quizId0);
      expect(res).toStrictEqual({ error: 'Quiz name is already in use' });
    });

    test('7. Token is not a valid structure', () => {
      res = updateNameQuizV2({ token: '-1' }, 'Quiz 0 Updated', quizId0);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });

    test('8. Not token of an active session', () => {
      logoutUserHandlerV2(tokenToJwt(token1));
      res = updateNameQuizV2(tokenToJwt(token1), 'Quiz 1 Updated', quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });
});

describe('Start new session', () => {
  let userJwt: Jwt;
  let userJwt2: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let quizId: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;

    userJwt2 = tokenToJwt(userToken2);
    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    createQuizQuestionHandler(quizId, userJwt, defaultQuestionBody);
  });

  describe('Unsucessful cases', () => {
    test('Quiz ID does not refer to a valid quiz', () => {
      expect(startSessionQuiz(userJwt, 0, quizId + 1)).toEqual(
        { error: 'Quiz ID does not refer to a valid quiz' }
      );
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      expect(startSessionQuiz(userJwt2, 0, quizId)).toEqual(
        { error: 'Quiz ID does not refer to a quiz that this user owns' }
      );
    });

    test('autoStartNum is greater than 50', () => {
      expect(startSessionQuiz(userJwt, 51, quizId)).toEqual({
        error: 'autoStartNum is a number greater than 50'
      });
    });

    test('More than 10 active sessions', () => {
      for (let i = 0; i <= 10; ++i) {
        expect(startSessionQuiz(userJwt, 30, quizId)).toHaveProperty('sessionId');
      }

      expect(startSessionQuiz(userJwt, 30, quizId)).toEqual({
        error: 'More than 10 active sessions'
      });
    });

    test('quiz does not have any questions in it', () => {
      const quizId2 = (RequestCreateQuizV2(userJwt2, 'Countries of the World', 'Quiz on all countries') as AdminQuizCreate).quizId;
      expect(startSessionQuiz(userJwt2, 0, quizId2)).toEqual({
        error: 'The quiz does not have any questions in it'
      });
    });
  });

  describe('Successful cases', () => {
    test('Single successful', () => {
      expect(startSessionQuiz(userJwt, 30, quizId)).toHaveProperty('sessionId');
    });
  });
});

describe('Update Quiz Description', () => {
  let token0: Token;
  let token1: Token;
  let quizId0: number;
  let quizId1: number;
  let res: OkObj | ErrorObj;
  let quizInfo: AdminQuizInfo;
  //  Giving a 20 second buffer for tests to run
  const timeBufferSeconds = 20;
  let quizEditedTime: number;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
    quizId0 = (RequestCreateQuizV2(tokenToJwt(token0), 'Quiz0', 'Description 0') as AdminQuizCreate).quizId;
    quizId1 = (RequestCreateQuizV2(tokenToJwt(token1), 'Quiz1', 'Description 1') as AdminQuizCreate).quizId;
  });

  describe('Successful test', () => {
    beforeEach(() => {
      quizEditedTime = Math.round(Date.now() / 1000);
      res = updateDescriptionQuizV2(tokenToJwt(token0), 'Updated description', quizId0) as OkObj;
      quizInfo = infoQuizV2(tokenToJwt(token0), quizId0) as AdminQuizInfo;
    });

    test('1. Updates the name of an existing quiz', () => {
      expect(quizInfo.description).toStrictEqual('Updated description');
      expect(res).toStrictEqual({});
    });

    test('2. Updates the time edited', () => {
      expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizEditedTime);
      expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(quizEditedTime + timeBufferSeconds);
      expect(res).toEqual({});
    });
  });

  describe('Unsuccessful test', () => {
    test('1. Returns an error when Quiz ID does not refer to a valid quiz', () => {
      res = updateDescriptionQuizV2(tokenToJwt(token0), 'Updated description', -9);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });

    test('2. Quiz ID does not refer to a quiz that this user owns', () => {
      res = updateDescriptionQuizV2(tokenToJwt(token0), 'Updated description', quizId1);
      expect(res).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });

    test('3.Description is more than 100 characters in length', () => {
      res = updateDescriptionQuizV2(tokenToJwt(token0), 'This is a description that is more than 100 characters long. It should trigger an error. ?!@ #$& *%)_@ ;-))1', quizId0);
      expect(res).toStrictEqual({ error: 'Description must be under 100 characters' });
    });

    test('6. Token is not a valid structure', () => {
      res = res = updateDescriptionQuizV2({ token: '-1' }, 'Updated description', quizId0);
      expect(res).toStrictEqual({ error: 'Token is not a valid structure' });
    });

    test('7. Not token of an active session', () => {
      logoutUserHandlerV2(tokenToJwt(token1));
      res = updateDescriptionQuizV2(tokenToJwt(token1), 'Updated description', quizId1);
      expect(res).toStrictEqual({ error: 'Token not for currently logged in session' });
    });
  });
});

describe('View Quizzes in Trash', () => {
  let userJwt: Jwt;
  let userJwt2: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let quizId: number;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
    userJwt2 = tokenToJwt(userToken2);
    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
  });

  describe('Unsuccessful tests', () => {
    test('Invalid token structure', () => {
      expect(viewQuizTrashHandlerV2({ token: '0' })).toEqual({
        error: 'Token is not a valid structure'
      });
    });

    test('Token is not logged in', () => {
      logoutUserHandlerV2(userJwt);
      expect(viewQuizTrashHandlerV2(userJwt)).toEqual({
        error: 'Provided token is valid structure, but is not for a currently logged in session'
      });
    });
  });

  describe('Successful tests', () => {
    test('Empty Trash', () => {
      expect(viewQuizTrashHandlerV2(userJwt)).toEqual({
        quizzes: []
      });

      expect(viewQuizTrashHandlerV2(userJwt2)).toEqual({
        quizzes: []
      });
    });

    test('Non empty trash', () => {
      const quizId2 = (RequestCreateQuizV2(userJwt2, 'Flags of the world', 'Flags on all countries') as AdminQuizCreate).quizId;

      RequestRemoveQuizV2(userJwt, quizId);
      expect(viewQuizTrashHandlerV2(userJwt)).toEqual({
        quizzes: [
          {
            quizId: quizId,
            name: 'Countries of the world'
          }
        ]
      });

      RequestRemoveQuizV2(userJwt2, quizId2);

      expect(viewQuizTrashHandlerV2(userJwt2)).toEqual({
        quizzes: [
          {
            quizId: quizId2,
            name: 'Flags of the world'
          }
        ]
      });
    });
  });
});

describe('Restore Quiz Trash', () => {
  let userJwt: Jwt;
  let userJwt2: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let quizId: number;
  let quizId2: number;
  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
    userJwt2 = tokenToJwt(userToken2);
    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuizV2(userJwt2, 'Flags of the world', 'Flags on all countries') as AdminQuizCreate).quizId;
    RequestRemoveQuizV2(userJwt2, quizId2);
  });

  describe('Unsuccessful tests', () => {
    test('Token is not a valid structure', () => {
      expect(trashRestoreQuizHandlerV2({ token: 'some token' }, quizId2)).toEqual({
        error: 'Token is not a valid structure'
      });
    });

    test('User is not logged in', () => {
      logoutUserHandlerV2(userJwt2);
      expect(trashRestoreQuizHandlerV2(userJwt2, quizId2)).toEqual({
        error: 'Provided token is valid structure, but is not for a currently logged in session'
      });
    });

    test('Quiz ID is invalid', () => {
      expect(trashRestoreQuizHandlerV2(userJwt, quizId + 5)).toEqual({
        error: 'Quiz ID does not refer to a valid quiz'
      });
    });

    test('Quiz ID does not refer to a valid quiz that the user owns', () => {
      expect(trashRestoreQuizHandlerV2(userJwt2, quizId)).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns'
      });
    });

    test('Quiz ID refers to quiz not currently in trash', () => {
      expect(trashRestoreQuizHandlerV2(userJwt, quizId)).toEqual({
        error: 'Quiz ID refers to a quiz that is not currently in the trash'
      });
    });
  });

  describe('Successful tests', () => {
    test('Restoring 1 quiz', () => {
      expect(trashRestoreQuizHandlerV2(userJwt2, quizId2)).toEqual({});
      expect(viewQuizTrashHandlerV2(userJwt2)).toEqual({
        quizzes: []
      });
    });

    test('Restoring multiple quizzes', () => {
      RequestRemoveQuizV2(userJwt, quizId);
      expect(trashRestoreQuizHandlerV2(userJwt2, quizId2)).toEqual({});
      expect(trashRestoreQuizHandlerV2(userJwt, quizId)).toEqual({});

      expect(viewQuizTrashHandlerV2(userJwt)).toEqual({
        quizzes: []
      });

      expect(viewQuizTrashHandlerV2(userJwt2)).toEqual({
        quizzes: []
      });
    });
  });
});

describe('Empty Quiz Trash', () => {
  let userJwt: Jwt;
  let userJwt2: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let quizId: number;
  let quizId2: number;
  let quizId3: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
    userJwt2 = tokenToJwt(userToken2);
    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    quizId2 = (RequestCreateQuizV2(userJwt, 'Flags of the world', 'Flags on all countries') as AdminQuizCreate).quizId;
    quizId3 = (RequestCreateQuizV2(userJwt2, 'Continents of the world', 'Flags on all continents') as AdminQuizCreate).quizId;
    RequestRemoveQuizV2(userJwt, quizId);
    RequestRemoveQuizV2(userJwt, quizId2);
    RequestRemoveQuizV2(userJwt2, quizId3);
  });

  describe('Unsuccessful tests', () => {
    test('Token is not a valid structure', () => {
      expect(trashRestoreQuizHandlerV2({ token: 'some token' }, quizId2)).toEqual({
        error: 'Token is not a valid structure'
      });
    });

    test('User is not logged in', () => {
      logoutUserHandlerV2(userJwt2);
      expect(trashRestoreQuizHandlerV2(userJwt2, quizId2)).toEqual({
        error: 'Provided token is valid structure, but is not for a currently logged in session'
      });
    });

    test('One more more Quiz IDs is not valid', () => {
      expect(emptyTrashHandlerV2(userJwt, JSON.stringify([quizId, quizId2, quizId2 + 4]))).toEqual({
        error: 'One or more of the Quiz IDs is not a valid quiz'
      });
    });

    test('One or more Quiz IDs refer to a quiz this current user doesnt own', () => {
      expect(emptyTrashHandlerV2(userJwt2, JSON.stringify([quizId, quizId2]))).toEqual({
        error: 'One or more of the Quiz IDs refers to a quiz that this current user does not own'
      });

      expect(emptyTrashHandlerV2(userJwt2, JSON.stringify([quizId, quizId3]))).toEqual({
        error: 'One or more of the Quiz IDs refers to a quiz that this current user does not own'
      });
    });

    test('One or more of the Quiz IDs is not currently in the trash', () => {
      trashRestoreQuizHandlerV2(userJwt, quizId);

      expect(emptyTrashHandlerV2(userJwt, JSON.stringify([quizId, quizId2]))).toEqual({
        error: 'One or more of the Quiz IDs is not currently in the trash'
      });
    });
  });

  describe('Successful Tests', () => {
    test('One user', () => {
      expect(emptyTrashHandlerV2(userJwt2, JSON.stringify([quizId3]))).toEqual({});
    });

    test('Multiple Users', () => {
      expect(emptyTrashHandlerV2(userJwt2, JSON.stringify([quizId3]))).toEqual({});
      expect(emptyTrashHandlerV2(userJwt, JSON.stringify([quizId, quizId2]))).toEqual({});
    });
  });
});

describe('Transfer Quiz', () => {
  let userJwt: Jwt;
  let userJwt2: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let quizId: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;

    userJwt2 = tokenToJwt(userToken2);
    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
  });

  describe('Unsuccessful Tests', () => {
    test('Quiz ID does not refer to a valid quiz', () => {
      expect(quizTransferHandlerV2(userJwt, 'JaneAusten@gmail.com', quizId + 1)).toEqual(
        { error: 'Quiz ID does not refer to a valid quiz' }
      );
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      expect(quizTransferHandlerV2(userJwt2, 'JaneAusten@gmail.com', quizId)).toEqual(
        { error: 'Quiz ID does not refer to a quiz that this user owns' }
      );
    });

    test('Email is not a real user', () => {
      expect(quizTransferHandlerV2(userJwt2, 'JaneAusten@gmail.com', quizId)).toEqual(
        { error: 'Quiz ID does not refer to a quiz that this user owns' }
      );
    });

    test('Email is not currently a logged in user', () => {
      expect(quizTransferHandlerV2(userJwt, 'JohnSmith@gmail.com', quizId)).toEqual(
        { error: 'userEmail is the current logged in user' }
      );
    });

    test('Quiz name is already used by user', () => {
      RequestCreateQuizV2(userJwt2, 'Countries of the world', 'Quiz on all countries V2');
      expect(quizTransferHandlerV2(userJwt, 'JaneAusten@gmail.com', quizId)).toEqual({
        error: 'Quiz ID refers to a quiz that has a name that is already used by the target user'
      });
    });
  });

  describe('Successful Tests', () => {
    test('Single quiz transfer', () => {
      expect(quizTransferHandlerV2(userJwt, 'JaneAusten@gmail.com', quizId)).toEqual({});
    });

    test('Multiple Quiz Transfers with Multiple Quizzes', () => {
      const quizId2 = (RequestCreateQuizV2(userJwt2, 'Flags of the world', 'Flags on all countries') as AdminQuizCreate).quizId;
      expect(quizTransferHandlerV2(userJwt, 'JaneAusten@gmail.com', quizId)).toEqual({});
      expect(quizTransferHandlerV2(userJwt2, 'JohnSmith@gmail.com', quizId)).toEqual({});
      expect(quizTransferHandlerV2(userJwt2, 'JohnSmith@gmail.com', quizId2)).toEqual({});
    });
  });
});

describe('Get Final Quiz', () => {
  let userJwt: Jwt;
  let userToken: Token;
  let userToken2: Token;
  let userJwt2: Jwt;
  let quizId: number;
  let defaultQuestionBody1 : QuestionBody;
  let defaultQuestionBody2 : QuestionBody;
  let sessionId: number;
  let playerId: number;
  let playerId2: number;
  let playerId3: number;

  beforeEach(() => {
    userToken = registerUser('JohnSmith@gmail.com', 'Password123', 'John', 'Smith') as Token;
    userJwt = tokenToJwt(userToken);
    userToken2 = registerUser('JaneAusten@gmail.com', 'Password123', 'Jane', 'Austen') as Token;
    userJwt2 = tokenToJwt(userToken2);

    quizId = (RequestCreateQuizV2(userJwt, 'Countries of the world', 'Quiz on all countries') as AdminQuizCreate).quizId;
    defaultQuestionBody1 = {
      question: 'What content is Japan in?',
      duration: 1,
      points: 10,
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
    defaultQuestionBody2 = {
      question: 'What content is Russia in?',
      duration: 1,
      points: 7,
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
    playerId3 = (playerJoinHelper(sessionId, 'John Smith') as PlayerReturn).playerId;

  });

  describe('Unsuccessful Tests', () => {
    test('Quiz ID does not refer to a valid quiz', () => {
      expect(getFinalQuizResultsHandler(quizId + 3, sessionId, userJwt)).toEqual(
        {error: 'Quiz ID does not refer to a valid quiz'}
      );
    });

    test('Quiz ID does not refer to a valid quiz that this user owns', () => {
      expect(getFinalQuizResultsHandler(quizId, sessionId, userJwt2)).toEqual({
        error: 'Quiz ID does not refer to a quiz that this user owns'
      });
    })

    test('Session Id does not refer to a valid session within this quiz', () =>{
      expect(getFinalQuizResultsHandler(quizId, -100, userJwt)).toEqual({
        error: 'Session Id does refer to a valid session within this quiz'
      });
    });

    test('Session is not in FINAL_RESULTS state', () => {
      expect(getFinalQuizResultsHandler(quizId, sessionId, userJwt)).toEqual({
        error: 'Session is not in FINAL_RESULTS state'
      });
    });
  });

  describe('Successful cases', () => {
    test('No answer has been submitted', () => {
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END');
      expect(getFinalQuizResultsHandler(quizId, sessionId, userJwt)).toEqual(
        {
          usersRankedByScore: [
            {
              name: "John Doe",
              score: 0
            },
            {
              name: "Titus Cha",
              score: 0
            },
            {
              name: "John Smith",
              score: 0
            }
          ],
          questionResults: [
            {
              questionId: 0,
              playersCorrect: [

              ]
            }
          ],
          averageAnswerTime: 0,
          percentCorrect: 0
        }
      );
    });

    test('Big test case', async () => {

      // First question - playyer 1 got it correct only
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(900);
      playerSubmitAnswerHandler([0,1], playerId, 1);
      playerSubmitAnswerHandler([0], playerId2, 1);
      await delay(1000);

      // Second question - player 2 got it correct first
      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'NEXT_QUESTION');
      await delay(900);
      playerSubmitAnswerHandler([0], playerId2, 1);
      playerSubmitAnswerHandler([0], playerId3, 2);
      playerSubmitAnswerHandler([0], playerId, 2);

      await delay(1000);

      updateQuizSessionStateHandler(quizId, sessionId, userJwt, 'END');

      expect(getFinalQuizResultsHandler(quizId, sessionId,userJwt)).toEqual(expect.objectContaining(        
        {
          "usersRankedByScore": [
            {
              name: "John Doe",
              points: 12.3

            },
            {
              name: "Titus Cha",
              points: 7
            },
            {
              name: "John Smith",
              points: 3.5
            }
          ],
          "questionResults": [
            {
              "questionId": 1,
              "questionCorrectBreakdown": [
                {
                  answerId: 0,
                  playersCorrect: [
                    "John Doe"
                  ]
                }
              ]
            },
            {
              "questionId": 2,
              "questionCorrectBreakdown": [
                {
                  answerId: 0,
                  playersCorrect: [
                    "Titus Cha",
                    "John Smith",
                    "John Doe"
                  ]
                }
              ]
            },

          ]

      }));
    });
    
  });
});