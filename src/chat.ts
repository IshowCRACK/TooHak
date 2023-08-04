import { Message, MessageReturn, OkObj } from '../interfaces/interfaces';
import HTTPError from 'http-errors';
import { getData } from './dataStore';

export function viewChat(playerId: number): MessageReturn {
  const data = getData();
  const session = data.quizSessions.find((session) => session.playerInfo.find((player) => player.playerId === playerId));
  if (!session) {
    throw HTTPError(400, 'Player ID is not valid');
  }

  return {
    messages: session.messages,
  };
}

export function sendChat(playerId: number, messageBody: string): OkObj {
  const data = getData();
  const session = data.quizSessions.find((session) => session.playerInfo.find((player) => player.playerId === playerId));
  if (!session) {
    throw HTTPError(400, 'Player ID is not valid');
  }

  if (messageBody.length < 1 || messageBody.length > 100 || messageBody == null) {
    throw HTTPError(400, 'Message body is less than 1 character or greater than 100 characters');
  }
  // THIS WILL BE IMPLEMENTED IN ANOTHER BRANCH AFTER THIS - I WROTE SO I DONT FORGET HEHE
  // const player = session.playerInfo.find((player) => player.playerId === playerId);
  const timeSent = Math.round(Date.now() / 1000);
  const player = session.playerInfo.find((player) => player.playerId === playerId);

  const message: Message = {
    messageBody: messageBody,
    playerId: playerId,
    playerName: player.name,
    timeSent: timeSent
  };

  data.quizSessions[data.quizSessions.indexOf(session)].messages.push(message);

  return {};
}
