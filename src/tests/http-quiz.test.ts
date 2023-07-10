const RequestViewDeletedQuiz = (email: string, password: string, nameFirst: string, nameLast:string): Token | ErrorObj => {
    const res = request(
      'POST',
      URL + 'v1/admin/auth/register',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }
      }
    );
    const parsedResponse: Jwt | ErrorObj = JSON.parse(res.body.toString());
  
    if ('error' in parsedResponse) {
      return parsedResponse;
    } else {
      return jwtToToken(parsedResponse);
    }
  };
describe('Quiz view Trash tests', () => {
    let jwt: Jwt;
    beforeEach(() => {
        const token = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
        //const quizId = createQuiz(token.sessionId, Quiz1, Description1) createQuizReturn;
        //removeQuiz(quizId, token.sessionId);
    });
    
    test('succesful view trash of 1 user', () => {

    });

});
