import { HideNsfwPicService } from '../usecase/hideNsfwPicService.js';

export async function handler(event, lambdaContext) {
	console.log('Start');
	const service = new HideNsfwPicService();
	await service.execute();
	console.log('End');
};
