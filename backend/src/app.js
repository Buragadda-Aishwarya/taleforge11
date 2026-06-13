import express from 'express';
import cors from 'cors';
import agentRoutes from './routes/agent.routes.js';
import characterRoutes from './routes/character.routes.js';
import { corsOptions } from './config/cors.js';
import continuityRoutes from './routes/continuity.routes.js';
import dbRoutes from './routes/db.routes.js';
import demoRoutes from './routes/demo.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import graphRoutes from './routes/graph.routes.js';
import healthRoutes from './routes/health.routes.js';
import locationRoutes from './routes/location.routes.js';
import researchRoutes from './routes/research.routes.js';
import sceneRoutes from './routes/scene.routes.js';
import storyRoutes from './routes/story.routes.js';
import worldRuleRoutes from './routes/worldRule.routes.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

app.disable('x-powered-by');

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(loggerMiddleware);

app.use('/', dbRoutes);
app.use('/health', healthRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/continuity', continuityRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/scene', sceneRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/world-rules', worldRuleRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
