const { hideNsfw4pService } = require('../domain/hideNsfw4p.js');

(async function() {
	const service = new hideNsfw4pService();
	await service.execute();
})();
