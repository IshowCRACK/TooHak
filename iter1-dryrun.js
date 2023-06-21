// iter 1 dry runs - run with node ../project-automarking/dryruns/iter1.test.js inside project-backend
(async() => {
  const process = require('process');
  const other = await import(process.cwd() + '/src/other.js');
  const auth = await import(process.cwd() + '/src/auth.js');
  const quiz = await import(process.cwd() + '/src/quiz.js');

  const assert = function(condition, message) {
    if (!condition) { throw Error('Assert failed'); }
  };

  const testClear = () => {
    auth.adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    other.clear();
    auth.adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    other.clear();
  };

  const testAdminAuthRegister = () => {
    other.clear();
    const data = auth.adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    assert(typeof data === 'object' && 'authUserId' in data && typeof data.authUserId === 'number');
  };

  const testAdminQuizCreate = () => {
    other.clear();
    const user = auth.adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    const data = quiz.adminQuizCreate(user.authUserId, 'Quiz name', 'Quiz description');
    assert(typeof data === 'object' && 'quizId' in data && typeof data.quizId === 'number');
  }

  const testAdminQuizList = () => {
    other.clear();
    const user = auth.adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    const quizId = quiz.adminQuizCreate(user.authUserId, 'Quiz name', 'Quiz description').quizId;
    const data = quiz.adminQuizList(user.authUserId);
    assert(
      typeof data === 'object' && 'quizzes' in data && typeof data.quizzes === 'object' && 'quizName' in data.quizzes
      && 'quizId' in data.quizzes && data.quizzes.quizName === 'Quiz name' && data.quizzes.quizId === quizId
    );
  }

  if (require.main === module) {
    const tests = [
      testClear, testAdminAuthRegister,
      testAdminQuizCreate, testAdminQuizList
    ];
    let failed = 0;
    for (let i = 0; i < tests.length; i++) {
      try {
        tests[i]();
      } catch (err) {
        failed++;
      }
    }
    console.log(`You passed ${tests.length - failed} out of ${tests.length} tests.`);
  }
})();
