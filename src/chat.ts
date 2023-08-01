import { Message, MessageReturn, OkObj } from '../interfaces/interfaces';
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

  const message: Message = {
    messageBody: messageBody,
    playerId: playerId
  };

  data.quizSessions[data.quizSessions.indexOf(session)].messages.push(message);
  // const sessionIndex = data.quizSessions.indexOf(session);
  // data.quizSessions[sessionIndex].messages.push(message);

  return {};
}
