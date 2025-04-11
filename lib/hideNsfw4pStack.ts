import { App, Stack, Duration } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { DockerImageFunction, DockerImageCode, Architecture } from 'aws-cdk-lib/aws-lambda';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

export class HideNsfw4pStack extends Stack {
	constructor(app: App, id: string) {
		super(app, id);

		this.assertRequiredEnvs();

		const lambdaFn = this.createLambdaFunction();
		this.addS3Bucket(lambdaFn);
		this.addScheduleEvent(lambdaFn);
		this.addCloudWatchAlarm(lambdaFn);
	}

	private createLambdaFunction() {
		return new DockerImageFunction(this, 'Singleton', {
			code: DockerImageCode.fromImageAsset('src/', {
				platform: Platform.LINUX_ARM64
			}),
			architecture: Architecture.ARM_64,
			retryAttempts: 0,
			memorySize: 1800,
			timeout: Duration.seconds(300),
			environment: {
				PIXIV_LOGIN_ID: process.env.PIXIV_LOGIN_ID!,
				PIXIV_PASSWORD: process.env.PIXIV_PASSWORD!,
				PIXIV_USER_ID: process.env.PIXIV_USER_ID!
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
		topic.addSubscription(new EmailSubscription(process.env.ALERT_TO!));

		alarm.addAlarmAction(new SnsAction(topic));
	}

	private assertRequiredEnvs():void {
		['PIXIV_LOGIN_ID','PIXIV_PASSWORD','PIXIV_USER_ID','ALERT_TO']
			.forEach(envName => this.assertIsDefined(process.env[envName], envName));
	}

	private	assertIsDefined<T>(val: T, envName: string): asserts val is NonNullable<T> {
		if (val === undefined || val === null) {
			throw new Error( `Expected '${envName}' to be defined, but not definded.`);
		}
	}

}

