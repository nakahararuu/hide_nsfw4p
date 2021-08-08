import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import * as ssm from '@aws-cdk/aws-ssm';

export class HideNsfw4pStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    const bucket = new s3.Bucket(this, 'MyBucket', { 'lifecycleRules': [{expiration: cdk.Duration.days(1)}] });

    const lambdaFn = new lambda.NodejsFunction(this, 'Singleton', {
      entry: 'src/lambda-handler.js',
      timeout: cdk.Duration.seconds(300),
      environment: {
        PIXIV_LOGIN_ID: ssm.StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_login_id'),
        PIXIV_PASSWORD: ssm.StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_login_password'),
        PIXIV_USER_ID: ssm.StringParameter.valueForStringParameter(this, '/hide_nsfw4p/pixiv_user_id'),
        BUCKET_NAME: bucket.bucketName
      }
    });
    bucket.grantReadWrite(lambdaFn);

    // Run 6:00 PM UTC every Monday through Friday
    // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression('cron(0 18 ? * MON-FRI *)')
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFn));
  }
}

