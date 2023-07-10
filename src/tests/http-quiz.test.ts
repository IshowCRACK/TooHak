import { ErrorObj, Jwt, OkObj, Token, JwtToken } from '../../interfaces/interfaces';
import request from 'sync-request';
import { getUrl } from '../helper';
import { jwtToToken, objToJwt, tokenToJwt } from '../token';
import { checkTokenValid } from './testHelpers';

const URL: string = getUrl();

// wrapper functions
const registerUser = (email: string, password: string, nameFirst: string, nameLast:string): Token | ErrorObj => {
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
      

const quizCreate = (token: string, name: string, description: string): OkObj | ErrorObj => {
	const res = request(
			'POST',
			URL + 'v1/admin/quiz',
			{
				json: {
						"token": token,
						"name": name,
						"description": description
				}
			}
		);
		const parsedResponse: OkObj | ErrorObj = JSON.parse(res.body.toString());
	
		return parsedResponse;
	};
	

        function clearUsers (): void {
                request(
                  'DELETE',
                  URL + 'v1/clear'
                );
              }
              


// TESTS FOR QUIZ //

beforeEach(() => {
        clearUsers();
      });

	describe('adminQuizCreate tests', () => {
                let jwt : string;
                beforeEach(() => {
                const token: Token | ErrorObj = registerUser('JohnSmith@gmail.com', 'Password123', 'Johnny', 'Jones') as Token;
                jwt = tokenToJwt(token).token;
                });

		describe('Unsuccessful tests', () => {
			
			test('AuthUserId is not a valid user', () => {
				const res: OkObj | ErrorObj = quizCreate('-5', 'John', 'Smith');
				const expectedResult = {
					error: 'AuthUserId is not a valid user' 
				};
			expect(res).toStrictEqual(expectedResult);
			});

			test('No name error', () => {
				const res: OkObj | ErrorObj = quizCreate(jwt, '', 'quizforcomp');
				const expectedResult = {
					error: 'A name must be entered'
				};
			expect(res).toStrictEqual(expectedResult);
			});

			test('Non alphanumeric name entered', () => {
				const res: OkObj | ErrorObj = quizCreate(jwt, '<name>', 'quizforcomp');
				const expectedResult = {
					error: 'Must use only alphanumeric characters or spaces in name' 
				};
			expect(res).toStrictEqual(expectedResult);
			});

			test('Less than 3 characters', () => {
				const res: OkObj | ErrorObj = quizCreate(jwt, 'hi', 'quizforcomp');
				const expectedResult = {
					error: 'Name must be between 3 and 30 characters'
				};
			expect(res).toStrictEqual(expectedResult);
			});

			test('More than 30 characters', () => {
				const res: OkObj | ErrorObj = quizCreate(jwt, 'abcdefghijklmnopqrstuvwxyz12345', 'quizforcomp');
				const expectedResult = {
					error: 'Name must be between 3 and 30 characters'
				};
			expect(res).toStrictEqual(expectedResult);
			});

			test('Name is already used by another quiz from same user', () => {
				quizCreate(jwt, 'comp1531it1', 'quiz');
				const res: OkObj | ErrorObj = quizCreate(jwt, 'comp1531it1', 'quiz');
				const expectedResult = {
					error: 'Quiz name is already in use'
				};
			expect(res).toStrictEqual(expectedResult);``
			});

			test('Description more than 100 characters ', () => {
				
				const res: OkObj | ErrorObj = quizCreate(jwt, 'comp1531',
			       'q7LzFg2hI4rR8tY0uOp2S3dE6fG1hJ4kL0zXcV3bN6mI8qW2aS5dF7gH0jK9lP1oR4tY7uI0pS3dF6gH9jK2llP5oR8tY1uI4pS7dF0gH3H')
				const expectedResult = {
					error: 'Quiz Description must be under 100 characters'
				};
			expect(res).toStrictEqual(expectedResult);
			});
	});

	describe('Successful tests', () => {
		test('Sucessful Quiz Creation', () => {
				
			const res: OkObj | ErrorObj = quizCreate(jwt, 'Science Quiz', 'quiz about science');
		expect(res).toStrictEqual(0);
		});

		test('Sucessful Quiz Creation with no description', () => {
				
			const res: OkObj | ErrorObj = quizCreate(jwt, 'Science Quiz', '');
		expect(res).toStrictEqual(0);
		});

		test('Sucessful Quiz Creation with numbers and letters', () => {
			const res: OkObj | ErrorObj = quizCreate(jwt, 'Sci3nce Qu1z', '123ABCD');
		expect(res).toStrictEqual(0);
		});

		test('Sucessful Quiz Creation with 2 quizzes', () => {
			const res1: OkObj | ErrorObj = quizCreate(jwt,  'Sci3nce Qu1z', '123ABCD');
		expect(res1).toStrictEqual(0);
		const res2: OkObj | ErrorObj = quizCreate(jwt, 'P7sics Qu1z', '123ABCD');
		expect(res2).toStrictEqual(1);
		});
		
	});
	
});