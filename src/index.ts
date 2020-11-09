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
app.set('json spaces', 2);
app.use(cors());

app.get('/:character', async (req, res) => {
	const {
		query: { dialog, mode = 'default' },
		params: { character },
	} = req;

	if (!dialog)
		return res.status(400).json({
			status: 400,
			message: 'Missing "dialog" query parameter in request.',
		});

	const bg = await loadImage('./assets/img/background.png');
	const face = await loadImage(`./assets/img/${character}/${mode}.png`).catch(
		() => null
	);

	if (!face)
		return res.status(404).json({
			status: 404,
			message: 'Character mode not found.',
		});

	const { width, height } = bg;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	ctx.drawImage(bg, 0, 0, width, height);
	ctx.drawImage(face, 14, 14, 142, 142);

	// Font style
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.textDrawingMode = 'path';
	ctx.fillStyle = 'white';

	const fontSize = 32;
	ctx.font = `${fontSize}px ${
		character.toLowerCase() === 'sans'
			? 'Comic Sans UT'
			: character === 'papyrus'
			? 'Papyrus UT'
			: 'Determination Mono'
	}`;

	// Split dialog lines
	const lines = dialog
		.toString()
		.split(' ')
		.reduce((acc, word) =>
			ctx.measureText(`${acc} ${word}`.split('\n').slice(-1)[0]).width < 360
				? `${acc} ${word}`
				: `${acc}\n${word}`
		)
		.split('\n');
	lines.length = Math.min(lines.length, 3);

	// Draw text
	ctx.fillText('*', 150, 30);
	lines.forEach((line, index) =>
		ctx.fillText(line, 180, 30 + index * (fontSize + 6))
	);

	// Send response
	res.setHeader('Content-Type', 'image/png');
	res.status(200).send(canvas.toBuffer());
});

app.get('/', async (req, res) => {
	const IMAGES = path.resolve('./assets/img/');
	const folders = fs
		.readdirSync(IMAGES)
		.filter(folder => !/\.png$/i.test(folder));

	const data = folders.reduce((acc, folder) => {
		const images = fs.readdirSync(path.join(IMAGES, folder));
		console.log(images);
		return { ...acc, [folder]: images.map(img => img.replace(/\.png$/i, '')) };
	}, {});

	res.status(200).json(data);
});

const { PORT = 5000 } = process.env;
app.listen(PORT, () => console.log(`App listening on port ${PORT}...`));
