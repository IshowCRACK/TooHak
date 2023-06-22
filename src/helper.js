// File for general helper functions used across multiple functions

import { getData } from './dataStore.js';

/**
  * Check if the userId is valid and exists
  *
  * @param {number} authUserId - the id you are checking is valid or not
  *
  * @returns {boolean} - returns true if userId is valid, false otherwise
 */
function checkAuthUserIdValid (authUserId) {
  const data = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) return true;
  }

  return false;
}

export { checkAuthUserIdValid };
