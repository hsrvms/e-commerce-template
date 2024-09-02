# for production guide: https://www.tomray.dev/nestjs-docker-production#writing-the-dockerfile
# for local development guide: https://www.tomray.dev/nestjs-docker-compose-postgres
ARG NODE_VERSION=22.0.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

#############################################
######## BUILD FOR LOCAL DEVELOPMENT ########
#############################################
FROM base AS dev
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
USER node

#############################################
########### BUILD FOR PRODUCTION ############
#############################################
FROM base AS build
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=dev /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force
USER node

FROM base AS prod
ENV NODE_ENV=production
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
CMD ["node", "dist/src/main.js"]
