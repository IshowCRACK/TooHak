import { getData, setData } from './dataStore.js';

/**
  * Reset the state of the application back to the start
  *
  * @returns {{}} - Returns empty object
*/
function clear () {
  const data = getData();

  // Reset user and quizzes array by making them empty
  data.users = [];
  data.quizzes = [];

  // Sets the new empty data object
  setData(data);

  return {};
}

export { clear };
