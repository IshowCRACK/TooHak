import { MessageReturn, OkObj } from '../interfaces/interfaces';
import HTTPError from 'http-errors';
import { getData } from './dataStore';

export function viewChat(playerId: number): MessageReturn {
  const data = getData();
  const session = data.quizSessions.find((session) => session.playerInfo.find((player) => player.playerId === playerId));
  console.log(session);
  if (!session) {
    throw HTTPError(400, 'Player ID is not valid');
  }

  return {
    messages: session.messages,
  };
}

export function tempSend(sessionId: number, playerId: number, messageBody: string): OkObj {
  const data = getData();
  const session = data.quizSessions.find((session) => session.sessionId === sessionId);
  session.messages.push({ messageBody: messageBody, playerId: playerId });

  return {

  };
}
