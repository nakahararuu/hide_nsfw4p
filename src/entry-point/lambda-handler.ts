import { HideNsfwPicService } from '../usecase/hideNsfwPicService.js';

export async function handler(): Promise<void> {
	let service;
	try {
		console.log('Start');
		service = await HideNsfwPicService.initContext();
		await service.execute();
	} finally {
		service?.close();
		console.log('End');
	}
}