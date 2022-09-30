import { App, Stack, Duration } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { DockerImageFunction, DockerImageCode } from 'aws-cdk-lib/aws-lambda';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

export class HideNsfw4pStack extends Stack {
	constructor(app: App, id: string) {
		super(app, id);

		const lambdaFn = this.createLambdaFunction();
		this.addS3Bucket(lambdaFn);
		this.addScheduleEvent(lambdaFn);
		this.addCloudWatchAlarm(lambdaFn);
	}

	private createLambdaFunction() {
		return new DockerImageFunction(this, 'Singleton', {
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
				PIXIV_USER_ID: StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_user_id')
			}
		});
	}

	private addS3Bucket(lambdaFn: DockerImageFunction) {
		const bucket = new Bucket(this, 'MyBucket', {
			lifecycleRules: [{expiration: Duration.days(5)}],
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL
		});
		bucket.grantReadWrite(lambdaFn);
		lambdaFn.addEnvironment('BUCKET_NAME', bucket.bucketName)
	}

	private addScheduleEvent(lambdaFn: DockerImageFunction) {
		const rule = new Rule(this, 'Rule', {
			schedule: Schedule.rate(Duration.hours(5))
		});
		rule.addTarget(new LambdaFunction(lambdaFn));
	}

	private addCloudWatchAlarm(lambdaFn: DockerImageFunction) {
		const alarm = lambdaFn.metricErrors().createAlarm(this, 'Alarm', {
			threshold: 1,
			evaluationPeriods: 1,
			alarmName: 'HideNSFW4p Errors'
		});

		const topic = new Topic(this, 'Alert Topic');
		const alertTo= StringParameter.valueForStringParameter(this, '/hide_nsfw4p/alert_to');
		topic.addSubscription(new EmailSubscription(alertTo));

		alarm.addAlarmAction(new SnsAction(topic));
	}
}

