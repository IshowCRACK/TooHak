// Reset module//the state of the application back to the start
// takes no premeter and returns empty object
import { getData, setData } from './dataStore.js';
function clear() {
	const data = getData();
	data.users = [];
	data.quizes = [];

	setData(data)
	return {};
}
export{ clear };
