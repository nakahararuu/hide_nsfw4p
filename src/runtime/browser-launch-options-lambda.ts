import { LaunchOptions } from 'playwright';

export const launchOptions: LaunchOptions = { args: [
			'--single-process', // required
			'--window-size=1920,1080',
			'--use-angle=swiftshader', // required
			'--disable-setuid-sandbox',
			'--no-sandbox',
		]
};