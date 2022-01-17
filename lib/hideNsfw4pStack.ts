import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');
import lambda = require('@aws-cdk/aws-lambda');
import s3 = require('@aws-cdk/aws-s3');
import cdk = require('@aws-cdk/core');
import ssm = require('@aws-cdk/aws-ssm');

export class HideNsfw4pStack extends cdk.Stack {
	constructor(app: cdk.App, id: string) {
		super(app, id);

		const bucket = new s3.Bucket(this, 'MyBucket', { 'lifecycleRules': [{expiration: cdk.Duration.days(20)}] });

		const lambdaFn = new lambda.DockerImageFunction(this, 'Singleton', {
			code: lambda.DockerImageCode.fromImageAsset('src/', {
				cmd: [ "entry-point/lambda-handler.handler" ],
				entrypoint: ["/lambda-entrypoint.sh"]
			}),
			retryAttempts: 0,
			memorySize: 1800,
			timeout: cdk.Duration.seconds(300),
			environment: {
				PIXIV_LOGIN_ID: ssm.StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_login_id'),
				PIXIV_PASSWORD: ssm.StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_login_password'),
				PIXIV_USER_ID: ssm.StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_user_id'),
				BUCKET_NAME: bucket.bucketName
			}
		});
		bucket.grantReadWrite(lambdaFn);

		const rule = new events.Rule(this, 'Rule', {
		  schedule: events.Schedule.rate(cdk.Duration.hours(5))
		});

		rule.addTarget(new targets.LambdaFunction(lambdaFn));
	}
}

