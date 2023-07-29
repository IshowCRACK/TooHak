import { Token } from '../interfaces/interfaces';
import { getData, setData } from './dataStore';
import { getLetter, getNumber } from './helper';
import { tokenToJwt } from './token';
import HTTPError from 'http-errors';
import { getSessionStatus } from './quiz';

export function playerJoin(sessionId: number, name: string) {
	return; 
}
