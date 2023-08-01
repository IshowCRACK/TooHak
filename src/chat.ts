import { Message, MessageReturn, Chat, QuizSession, QuizSessionAdmin } from "../interfaces/interfaces";
import HTTPError from 'http-errors';
import { getData } from './dataStore';
import { pushChatForViewChatHandler } from "./tests/testhelpersV2";

export function viewChat(playerId: number): MessageReturn {
  const data = getData();

  const session = data.quizSessions.find((session) => session.playerInfo.find((player) => player.playerId === playerId ))
  if (!session) {
    throw HTTPError(400, 'Played ID is not valid');
  }

  return{
    messages: session.messages,
  }
}