import { loadImage, createCanvas } from 'canvas';
import { RequestHandler } from 'express';

const characterRoute: RequestHandler = async (req, res) => {
	const {
		query: { dialog, mode = 'default' },
		params: { character },
	} = req;

	const text = dialog?.toString().trim().replace(/\s+/, ' ');

	// Check if dialog was provided
	if (!text)
		return res.status(400).json({
			status: 400,
			message:
				'Missing "dialog" query parameter in request, or invalid text provided.',
		});

	// Load images
	const bg = await loadImage('./assets/img/background.png');
	const face = await loadImage(`./assets/img/${character}/${mode}.png`).catch(
		() => null
	);

	// Check if character face exists
	if (!face)
		return res.status(404).json({
			status: 404,
			message: `Face mode "${mode}" for character "${character}" not found.`,
		});

	// Create canvas and draw images
	const { width, height } = bg;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(bg, 0, 0, width, height);
	ctx.drawImage(face, 6, 6, 142, 142);

	// Font style
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.textDrawingMode = 'path';
	ctx.fillStyle = 'white';
	const fontSize = 32;

	// Select font family
	ctx.font = `${fontSize}px ${
		character.toLowerCase() === 'sans'
			? 'Comic Sans UT'
			: character === 'papyrus'
			? 'Papyrus UT'
			: 'Determination Mono'
	}`;

	// Split dialog lines
	const lines = text
		.toString()
		.trim()
		.split(/\s+/)
		.reduce(
			(acc, word) =>
				acc +
				(ctx.measureText(`${acc.split('\n').slice(-1)[0]} ${word}`).width < 370
					? ' '.repeat(+(acc !== ''))
					: '\n') +
				word,
			''
		)
		.split('\n');
	lines.length = Math.min(lines.length, 3);

	// Draw text
	ctx.fillText('*', 142, 22);
	lines.forEach((line, index) =>
		ctx.fillText(line.trim(), 172, 22 + index * (fontSize + 6))
	);

	// Send response
	res.setHeader('Content-Type', 'image/png');
	res.status(200).send(canvas.toBuffer());
};

export default characterRoute;
