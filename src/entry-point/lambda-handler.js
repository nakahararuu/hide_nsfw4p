import { HideNsfw4pService } from '../domain/hideNsfw4p.js';

export async function handler(event, lambdaContext) {
	console.log('Start');
	const service = new HideNsfw4pService();
	await service.execute();
	console.log('End');
};
