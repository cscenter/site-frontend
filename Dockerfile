FROM node:14.17-buster-slim

WORKDIR /opt/code/
COPY . /opt/code/

RUN npm install -g npm@7
RUN npm ci

ARG WEBPACK_ENVIRONMENT
RUN if [ "x$WEBPACK_ENVIRONMENT" = "x" ]; then echo "WEBPACK_ENVIRONMENT argument is not provided" ; exit 1;  fi
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_PROJECT=cscenter
ARG SENTRY_ORG=compscicenterru

# FIXME: git not found (see commands in package.json)
RUN SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN SENTRY_PROJECT=$SENTRY_PROJECT SENTRY_ORG=$SENTRY_ORG npm run ${WEBPACK_ENVIRONMENT}:1
RUN SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN SENTRY_PROJECT=$SENTRY_PROJECT SENTRY_ORG=$SENTRY_ORG npm run ${WEBPACK_ENVIRONMENT}:2
