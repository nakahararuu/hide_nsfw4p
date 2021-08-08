FROM public.ecr.aws/lambda/nodejs:12 
# Alternatively, you can pull the base image from Docker Hub: amazon/aws-lambda-nodejs:12 
# Copy the Lambda functions 
COPY lambda-handler.js package.json package-lock.json ${LAMBDA_TASK_ROOT}/ 
# Install NPM dependencies for functions 
RUN npm install
