import { HideNsfwPicService } from '../usecase/hideNsfwPicService.js';

(async function () {
	let service;
	try {
		service = await HideNsfwPicService.initContext();
		await service.execute();
	} finally {
		service?.close();
	}
})();
