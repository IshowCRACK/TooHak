/**
  * Function gets data from dataStore and resets them to an empty state
	* Used mostly in testing
  * 
  * @param {} - take no input
  * 
  * @returns {} - returns no output
*/

import { getData, setData } from './dataStore.js';

function clear() {
	
	const data = getData();
	
	// Resets users and quizes array making them empty
	data.users = [];
	data.quizes = [];

	setData(data)
	return {};
}

export{ clear };
