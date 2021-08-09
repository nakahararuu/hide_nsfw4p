const chromium = require('chrome-aws-lambda');
const playwright = require('playwright-core');
const { main } = require('./main.js');

exports.handler = async function(event, lambdaContext) {
	console.log('Start');
	await main();
	console.log('End');
};
