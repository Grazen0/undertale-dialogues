import { registerFont } from 'canvas';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import characterRoute from './routes/character';
import indexRoute from './routes';
import morgan from 'morgan';

// Register fonts
const FONTS = path.resolve('./assets/fonts');
fs.readdirSync(FONTS).forEach(file =>
	registerFont(path.join(FONTS, file), { family: file.split('.').slice(-2)[0] })
);

const app = express();
const { PORT = 5000 } = process.env;

app.use(cors());
if (process.argv.includes('-d')) app.use(morgan('dev'));

// Routes
app.get('/:character', characterRoute);
app.get('/', indexRoute);

app.listen(PORT, () => console.log(`App listening on port ${PORT}...`));
