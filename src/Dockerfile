FROM node:18-bookworm

ARG FUNCTION_DIR="/function"
# Required because
# by default playwright installs Browser Binaries under /root/.cache/ms-playwright
# and Lambda does not allow root user
ENV PLAYWRIGHT_BROWSERS_PATH=/playwright
# Required for Node runtimes which use npm@8.6.0+ because
# by default npm writes logs under /home/.npm and Lambda fs is read-only
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Copy function code
RUN mkdir -p ${FUNCTION_DIR}
COPY . ${FUNCTION_DIR}

# Install aws-lambda-cpp build dependencies
RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev

# Install Dependencies and Browser Binaries
WORKDIR ${FUNCTION_DIR}
RUN npm ci --omit=dev
RUN npx -y playwright@1.51.1 install --with-deps chromium

ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD [".dist/entry-point/lambda-handler.handler"]