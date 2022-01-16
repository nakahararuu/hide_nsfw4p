FROM public.ecr.aws/lambda/nodejs:12 

# Copy the Lambda functions 
COPY . ${LAMBDA_TASK_ROOT}/

# Install NPM dependencies for functions 
RUN npm ci --production

