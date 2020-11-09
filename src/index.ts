import { createCanvas, loadImage, registerFont } from 'canvas';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Register fonts
const FONTS = path.resolve('./assets/fonts');
fs.readdirSync(FONTS).forEach(file =>
	registerFont(path.join(FONTS, file), { family: file.split('.').slice(-2)[0] })
);

const app = express();
app.use(cors());

app.get('/', async (req, res) => {
	const { dialog = 'hey bud, you should give some text' } = req.query;
	const bg = await loadImage('./assets/img/background.png');

	const { width, height } = bg;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	ctx.drawImage(bg, 0, 0, width, height);

	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';

	// Font style
	const fontSize = 32;
	ctx.font = `${fontSize}px Comic Sans UT`;
	ctx.textDrawingMode = 'path';
	ctx.fillStyle = 'white';

	// Split dialog lines
	const lines = dialog
		.toString()
		.split(' ')
		.reduce((acc, word) =>
			`${acc} ${word}`.split('\n').slice(-1)[0].length < 22
				? `${acc} ${word}`
				: `${acc}\n${word}`
		)
		.split('\n');
	lines.length = Math.min(lines.length, 3);

	ctx.fillText('*', 170, 30);
	lines.forEach((line, index) =>
		ctx.fillText(line, 200, 30 + index * (fontSize + 6))
	);

	res.setHeader('Content-Type', 'image/png');
	res.status(200).send(canvas.toBuffer());
});

const { PORT = 5000 } = process.env;
app.listen(PORT, () => console.log(`App listening on port ${PORT}...`));
