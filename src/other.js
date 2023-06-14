// Reset the state of the application back to the start
// takes no premeter and returns empty object
import { getData, setData } from 'dataStore.js';
function clear() {
    const data = {
    User = [{}],
    Quizes = [{}],
    };
    setData(data)
    return {};
}
module.export = clear;