import { HideNsfwPicService } from '../usecase/hideNsfwPicService.js';

(async function() {
	const service = new HideNsfwPicService();
	await service.execute();
})();
