## Table of Contents
1. [Description](#description)
2. [Project setup](#project-setup)
3. [Resources](#resources)
4. [Multiple ENV Config](#multiple-env-config)
5. [Features](#features)

## Description

Backend template written in TypeScript with NestJS

## Project setup

```bash
$ npm install
# To use NestJS CLI install it globally
$ npm i -g @nestjs/cli
```

### Compile and run the project
Docker is highly recommended for development. Please make sure that Docker Engine is installed in your PC. There is basically configured multi-stage Dockerfile which can be used for deployment and development purposes in this repository.
```bash
# development
$ docker compose up

# if there is an existing docker image built before and fresh build needed
$ docker compose up --build

# for detached terminal
$ docker compose up -d
```

### Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Resources

Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- A comprehensive [local development guide](https://www.tomray.dev/nestjs-docker-compose-postgres#add-redis-to-docker-composez) using Docker with this project. 
- To create optimized Dockerfile for production check [this guide](https://www.tomray.dev/nestjs-docker-production). 
- [Redis usage with NestJS](https://medium.com/@mut1aq/using-redis-in-nestjs-8ca1a009670f)

## Multiple ENV Config
.env files has been choosen by the current `NODE_ENV` situation. If `NODE_ENV=development` the choosen env file would be `./config/env/development.env`

After changing the .env files they should be validated in `./config/validation.ts` file for better development experience. Also they can be added into `./config/FILE_NAME.config.ts` file to use them easily. This [documentation](https://docs.nestjs.com/techniques/configuration) would be helpful for those who are new in NestJS.

## Features
1. [Auth](src/auth)
2. [Users](src/users)
