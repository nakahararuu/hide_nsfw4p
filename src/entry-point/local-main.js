import { HideNsfw4pService } from '../domain/hideNsfw4p.js';

(async function() {
	const service = new HideNsfw4pService();
	await service.execute();
})();
