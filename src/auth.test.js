
import { adminAuthLogin } from 'quiz.js';
//adminAuthLogin
test('Test successful adminAuthLogin', () => {
    let person1 = adminAuthRegister('hayden.smith@unsw.edu.au','123ABCabc!@#$');
    let person2 = adminAuthRegister('john.smith@unsw.edu.au','1Aa!');
  
    let result = adminAuthLogin('hayden.smith@unsw.edu.au','123ABCabc!@#$');
    expect(result).toBe('1');
    let result2 = adminAuthLogin('hayden.smith2@unsw.edu.au','123ABCabc!@#$');
    expect(result).toBe('2');
  });
  
  test('Test error cases', () => {
    //Email doesnt exist
    expect(adminAuthLogin('wrong.email@unsw.edu.au','1234')).toEqual({ error: 'Email does not exist' });
    //Password Wrong
    expect(adminAuthLogin('hayden.smith@unsw.edu.au','wrong_password')).toStrictEqual({ error: 'Wrong pasword' });
  });