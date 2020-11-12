import { RequestHandler } from 'express';
import path from 'path';
import fs from 'fs';

const indexRoute: RequestHandler = (req, res) => {
	const IMAGES = path.resolve('./assets/img/');
	const folders = fs
		.readdirSync(IMAGES)
		.filter(folder => !/\.png$/i.test(folder));

	const data = folders.reduce(
		(acc, folder) => ({
			...acc,
			[folder]: fs
				.readdirSync(path.join(IMAGES, folder))
				.map(img => img.replace(/\.png$/i, '')),
		}),
		{}
	);

	res.status(200).json(data);
};

export default indexRoute;
