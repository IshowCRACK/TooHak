import { ClearReturn, Data } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';

/**
  * Reset the state of the application back to the start
  *
  * @returns {{}} - Returns empty object
*/
function clear (): ClearReturn {
  const data: Data = getData();

  // Reset user and quizzes array by making them empty
  data.users = [];
  data.quizzes = [];
  data.session = [];
  data.metaData.totalUsers = 0;
  data.metaData.totalQuizzes = 0;

  // Sets the new empty data object
  setData(data);

  return {};
}

export { clear };
