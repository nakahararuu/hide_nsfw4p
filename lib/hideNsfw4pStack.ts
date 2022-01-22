import { App, Stack, Duration } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { DockerImageFunction, DockerImageCode } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class HideNsfw4pStack extends Stack {
	constructor(app: App, id: string) {
		super(app, id);

		const bucket = new Bucket(this, 'MyBucket', { 'lifecycleRules': [{expiration: Duration.days(20)}] });

		const lambdaFn = new DockerImageFunction(this, 'Singleton', {
			code: DockerImageCode.fromImageAsset('src/', {
				cmd: [ "entry-point/lambda-handler.handler" ],
				entrypoint: ["/lambda-entrypoint.sh"]
			}),
			retryAttempts: 0,
			memorySize: 1800,
			timeout: Duration.seconds(300),
			environment: {
				PIXIV_LOGIN_ID: StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_login_id'),
				PIXIV_PASSWORD: StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_login_password'),
				PIXIV_USER_ID: StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_user_id'),
				BUCKET_NAME: bucket.bucketName
			}
		});
		bucket.grantReadWrite(lambdaFn);

		const rule = new Rule(this, 'Rule', {
		  schedule: Schedule.rate(Duration.hours(5))
		});

		rule.addTarget(new LambdaFunction(lambdaFn));
	}
}

