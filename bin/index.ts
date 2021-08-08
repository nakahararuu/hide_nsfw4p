import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');
import lambda = require('@aws-cdk/aws-lambda-nodejs');
import s3 = require('@aws-cdk/aws-s3');
import cdk = require('@aws-cdk/core');
import ssm = require('@aws-cdk/aws-ssm');

export class LambdaCronStack extends cdk.Stack {
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

const app = new cdk.App();
new LambdaCronStack(app, 'LambdaCronExample');
app.synth();
