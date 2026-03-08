import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import ratelimit from 'express-rate-limit';
import {fileURLToPath} from 'url';
import { dirname, join } from 'path';
import routes from './routes/index.js';
import {errorHandler} from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set('trust proxy', 1);

const limiter = ratelimit({
    windowMs: 15*60*1000,  //in ms to remember a request
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors({origin: process.env.CLIENT_URL || '*'}));
app.use(helmet());
app.use(express.json({limit: '10mb'}));   //request size
// app.use('/api',limiter);
app.use('/api',routes);
app.use((req,res)=>{
    res.status(404).json({error : 'Not Found'});
});
app.use(errorHandler);
export default app;