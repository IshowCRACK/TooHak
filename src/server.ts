import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import { adminAuthRegister, adminAuthLogin, adminAuthLogout, adminUserDetails } from './auth';
import { adminQuizCreate, adminQuizRemove, adminQuizList, adminQuizInfo, adminQuizTransfer, adminQuizNameUpdate, adminQuizDescriptionUpdate } from './quiz';
import { clear } from './other';
import { formatError } from './helper';
import { getData } from './dataStore';
import { quizCreateQuestion, quizDuplicateQuestion, adminQuizDelete } from './question';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync('./swagger.yaml', 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  const ret = echo(data);
  if ('error' in ret) {
    res.status(400);
  }
  return res.json(ret);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }

  res.status(200).json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = adminAuthLogin(email, password);

  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }

  res.status(200).json(response);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  res.json(response);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const response = adminAuthLogout({ token: token });

  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }

  res.status(200).json(response);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminUserDetails({ token: token });

  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }

  res.status(200).json(response);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const response = adminQuizCreate({ token: token }, name, description);
  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }

  res.status(200).json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizList({ token: token });

  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }

  res.status(200).json(response);
});

app.delete('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = req.query.token as string;
  const response = adminQuizRemove({ token: token }, quizId);
  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }

  res.status(200).json(response);
});

app.get('/v1/admin/quiz/:quizId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const token = req.query.token as string;
  const response = adminQuizInfo({ token: token }, quizId);
  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }

  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, questionBody } = req.body;
  const response = quizCreateQuestion({ token: token }, questionBody, quizId);
  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, userEmail } = req.body;
  const response = adminQuizTransfer({ token: token }, userEmail, quizId);

  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }

  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, name } = req.body;
  const response = adminQuizNameUpdate({ token: token }, name, quizId);
  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }
  res.status(200).json(response);
});

app.delete('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const token = req.query.token as string;
  const response = adminQuizDelete({ token: token }, quizId, questionId);
  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }
  res.status(200).json(response);
});

app.put('/v1/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, description } = req.body;
  const response = adminQuizDescriptionUpdate({ token: token }, description, quizId);
  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }
  res.status(200).json(response);
});

app.post('/v1/admin/quiz/:quizId/question/:questionId/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const { token } = req.body;
  const response = quizDuplicateQuestion({ token: token }, quizId, questionId);
  if ('error' in response) {
    return res.status(response.statusCode).json(formatError(response));
  }
  res.status(200).json(response);
});

// For Debugging
app.get('/debug', (req: Request, res: Response) => {
  const data = getData();

  res.json(data);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
