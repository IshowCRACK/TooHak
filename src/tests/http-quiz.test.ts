import { ErrorObj, Jwt, OkObj, Token, AdminQuizCreateReturn } from '../../interfaces/interfaces';
import { registerUser} from './http-auth.test'
import request from 'sync-request';
import { getUrl } from '../helper';
import { jwtToToken, objToJwt, tokenToJwt } from '../token';
import { checkTokenValid } from './testHelpers';

const URL: string = getUrl();

// CLEAR //
function clearUsers (): void {
  request(
    'DELETE',
    URL + 'v1/clear'
  );
}

beforeEach(() => {
  clearUsers();
});

// Wrapper functions
const RequestCreateQuiz = (jwt: Jwt, name: string, description: string): AdminQuizCreateReturn => {
  const res = request(
    'POST',
    URL + 'v1/admin/quiz',
    {
      json: {
        token: jwt,
        name: name,
        description: description,
      }
    }
  );
  const parsedResponse: AdminQuizCreateReturn = JSON.parse(res.body.toString());

  if ('error' in parsedResponse) {
    return parsedResponse;
  } else {
    return parsedResponse;
  }
};

// TESTS FOR QUIZ CREATE //
describe('Quiz view Trash tests', () => {
  let jwt: Jwt;
  let token0: Token;
  let token1: Token;

  beforeEach(() => {
    token0 = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
    token1 = registerUser('JoeMama@gmail.com', 'Password456', 'Joe', 'Mama') as Token;
  });
  describe ('Successful Tests', ()=> {
    test('Successfull Quiz Create for 1 User', () => {
      console.log(objToJwt(token0));
    });
  })
});
