const hideNsfw4p = require('./hideNsfw4p.js');

exports.handler = async function(event, lambdaContext) {
	console.log('Start');
	await hideNsfw4p();
	console.log('End');
};
