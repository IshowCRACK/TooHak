import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import { adminAuthRegister, adminAuthLogin, adminAuthLogout, adminUserDetails, adminUpdateUserDetails, adminUpdateUserPassword } from './auth';
import { adminQuizCreate, adminQuizRemove, adminQuizList, adminQuizInfo, adminQuizTransfer, adminQuizNameUpdate, adminQuizDescriptionUpdate, quizTrash, adminQuizRestore, adminQuizEmptyTrash, quizStartSession, createQuizThumbnail, updateQuizSessionState, getSessionStatus, viewSessions, getFinalQuizResults, getFinalQuizResultsCsv } from './quiz';
import { clear } from './other';
import { convertStringToArray } from './helper';
import { getData } from './dataStore';
import { quizCreateQuestion, adminQuizDelete, quizDuplicateQuestion, quizMoveQuestion, quizUpdateQuestion } from './question';
import { quizCreateQuestionV2, deleteQuestionV2, quizUpdateQuestionV2 } from './questionV2';
import { playerJoin, playerQuestionInfo, playerSubmitAnswer, getQuestionResults, playerStatus } from './player';
import { viewChat, sendChat } from './chat';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for producing the docs that define the API
const file = fs.readFileSync('./swagger.yaml', 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// for logging errors (print to terminal)
app.use(morgan('dev'));

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  res.status(200).json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = adminAuthLogin(email, password);

  res.status(200).json(response);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  res.json(response);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const response = adminAuthLogout({ token: token });

  res.status(200).json(response);
});
// it1 user details
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminUserDetails({ token: token });

  res.status(200).json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = adminUpdateUserPassword({ token: token }, oldPassword, newPassword);

  res.status(200).json(response);
});

// it2 update user details
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const response = adminUpdateUserDetails({ token: token }, email, nameFirst, nameLast);
  res.status(200).json(response);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const response = adminQuizCreate({ token: token }, name, description);

  res.status(200).json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizList({ token: token });

  res.status(200).json(response);
});

app.delete('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = req.query.token as string;
  const response = adminQuizRemove({ token: token }, quizId);

  res.status(200).json(response);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const jwtToken = req.query.token as string;
  const response = quizTrash({ token: jwtToken });

  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = req.query.token as string;
  const response = adminQuizInfo({ token: token }, quizId);
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, questionBody } = req.body;
  const response = quizCreateQuestion({ token: token }, questionBody, quizId);

  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, userEmail } = req.body;
  const response = adminQuizTransfer({ token: token }, userEmail, quizId);

  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, name } = req.body;
  const response = adminQuizNameUpdate({ token: token }, name, quizId);

  res.status(200).json(response);
});

app.delete('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const token = req.query.token as string;
  const response = adminQuizDelete({ token: token }, quizId, questionId);

  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, description } = req.body;
  const response = adminQuizDescriptionUpdate({ token: token }, description, quizId);

  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const { token, questionBody } = req.body;
  const response = quizUpdateQuestion({ token: token }, questionBody, quizId, questionId);

  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const { token } = req.body;
  const response = quizDuplicateQuestion({ token: token }, quizId, questionId);

  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizId/question/:questionId/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const { token, newPosition } = req.body;
  const response = quizMoveQuestion(quizId, questionId, newPosition, { token: token });

  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token } = req.body;
  const response = adminQuizRestore({ token: token }, quizId);

  res.status(200).json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token: string = req.query.token as string;
  const quizIdsString = req.query.quizIds as string[];
  const quizIds = quizIdsString.map((item: string) => parseInt(item));

  const response = adminQuizEmptyTrash({ token: token }, quizIds);

  res.status(200).json(response);
});

// For Debugging
app.get('/debug', (req: Request, res: Response) => {
  const data = getData();

  res.json(data);
});

app.post('/v1/admin/quiz/:quizId/thumbnail', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const quizId = parseInt(req.params.quizId);
  const { imgUrl } = req.body;

  const response = createQuizThumbnail({ token: token }, quizId, imgUrl);
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizId/sessions', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const quizId = parseInt(req.params.quizId);

  const response = viewSessions({ token: token }, quizId);
  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizId/session/:sessionId', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const sessionId = parseInt(req.params.sessionId);
  const quizId = parseInt(req.params.quizId);
  const { action } = req.body;

  const response = updateQuizSessionState(quizId, sessionId, { token: token }, action);
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizId/session/:sessionId', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const sessionId = parseInt(req.params.sessionId);
  const quizId = parseInt(req.params.quizId);

  const response = getSessionStatus(quizId, sessionId, { token: token });
  res.status(200).json(response);
});

app.get('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerId);
  const response = viewChat(playerId);

  res.status(200).json(response);
});

app.put('/v1/player/:playerId/question/:questionPosition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const questionPosition = parseInt(req.params.questionPosition);
  const { answerIds } = req.body;

  const response = playerSubmitAnswer(answerIds, playerId, questionPosition);
  res.status(200).json(response);
});

app.get('/v1/player/:playerId/question/:questionPosition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const questionPosition = parseInt(req.params.questionPosition);
  const response = getQuestionResults(playerId, questionPosition);
  res.status(200).json(response);
});

app.post('/v1/player/:playerId/chat', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerId);
  const { messageBody } = req.body;
  const response = sendChat(playerId, messageBody);

  res.status(200).json(response);
});

/// /////////////////////////////// V2 ROUTES /////////////////////////////////////

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const response = quizTrash({ token: token });

  res.status(200).json(response);
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const response = adminAuthLogout({ token: token });

  res.status(200).json(response);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const response = adminUserDetails({ token: token });

  res.status(200).json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const { email, nameFirst, nameLast } = req.body;
  const response = adminUpdateUserDetails({ token: token }, email, nameFirst, nameLast);

  res.status(200).json(response);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const { oldPassword, newPassword } = req.body;
  const response = adminUpdateUserPassword({ token: token }, oldPassword, newPassword);

  res.status(200).json(response);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const { name, description } = req.body;
  const response = adminQuizCreate({ token: token }, name, description);

  res.status(200).json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const response = adminQuizList({ token: token });

  res.status(200).json(response);
});

app.delete('/v2/admin/quiz/:quizId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token: string = req.header('token') as string;
  const response = adminQuizRemove({ token: token }, quizId);

  res.status(200).json(response);
});

app.get('/v2/admin/quiz/:quizId', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const quizId = parseInt(req.params.quizId);
  const response = adminQuizInfo({ token: token }, quizId);

  res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token: string = req.header('token') as string;
  const { name } = req.body;
  const response = adminQuizNameUpdate({ token: token }, name, quizId);

  res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token: string = req.header('token') as string;
  const { description } = req.body;
  const response = adminQuizDescriptionUpdate({ token: token }, description, quizId);

  res.status(200).json(response);
});

app.post('/v2/admin/quiz/:quizId/restore', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const quizId = parseInt(req.params.quizId);
  const response = adminQuizRestore({ token: token }, quizId);

  res.status(200).json(response);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token: string = req.header('token') as string;
  const quizIdsInput = req.query.quizIds as string;
  const quizIdsString = convertStringToArray(quizIdsInput);
  const quizIds = quizIdsString.map((item: string) => parseInt(item));
  const response = adminQuizEmptyTrash({ token: token }, quizIds);

  res.status(200).json(response);
});

app.post('/v2/admin/quiz/:quizId/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token: string = req.header('token') as string;
  const { email } = req.body;
  const response = adminQuizTransfer({ token: token }, email, quizId);

  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token: string = req.header('token') as string;
  const { autoStartNum } = req.body;
  const response = quizStartSession({ token: token }, parseInt(autoStartNum), quizId);

  res.status(200).json(response);
});

app.post('/v2/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token: string = req.header('token') as string;
  const { questionBody } = req.body;
  const response = quizCreateQuestionV2({ token: token }, questionBody, quizId);

  res.status(200).json(response);
});
app.delete('/v2/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const token: string = req.header('token') as string;
  const response = deleteQuestionV2({ token: token }, quizId, questionId);

  res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizId/question/:questionId/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const { newPosition } = req.body;
  const token: string = req.header('token') as string;
  const response = quizMoveQuestion(quizId, questionId, newPosition, { token: token });

  res.status(200).json(response);
});

app.post('/v2/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const token: string = req.header('token') as string;
  const response = quizDuplicateQuestion({ token: token }, quizId, questionId);

  res.status(200).json(response);
});

app.put('/v2/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const { questionBody } = req.body;
  const token: string = req.header('token') as string;
  const response = quizUpdateQuestionV2({ token: token }, questionBody, quizId, questionId);
  res.status(200).json(response);
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  const response = playerJoin(sessionId, name);
  res.status(200).json(response);
});

app.get('/v1/player/:playerId', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const response = playerStatus(playerId);
  res.status(200).json(response);
});

app.get('/v1/player/:playerId/question/:questionPosition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerId);
  const questionPosition = parseInt(req.params.questionPosition);
  const response = playerQuestionInfo(playerId, questionPosition);
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizId/session/:sessionId/results', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const sessionId = parseInt(req.params.sessionId);
  const token: string = req.header('token') as string;
  const response = getFinalQuizResults(quizId, sessionId, { token: token });
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizId/session/:sessionId/results/csv', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const sessionId = parseInt(req.params.sessionId);
  const token: string = req.header('token') as string;
  const response = getFinalQuizResultsCsv(quizId, sessionId, { token: token });
  res.status(200).json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
