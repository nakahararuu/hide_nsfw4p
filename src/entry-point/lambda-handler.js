const { hideNsfw4pService } = require('../domain/hideNsfw4p.js');

exports.handler = async function(event, lambdaContext) {
	console.log('Start');
	const service = new hideNsfw4pService();
	await service.execute();
	console.log('End');
};
