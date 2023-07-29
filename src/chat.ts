import { MessageReturn } from "../interfaces/interfaces";
import HTTPError from 'http-errors';

export function viewChat(playerId: number): MessageReturn {
  if (true) {
    throw HTTPError(400, 'Played ID does not not valid');
  }
  
  return;
}