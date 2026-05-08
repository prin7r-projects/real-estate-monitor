FROM node:20-alpine AS base
WORKDIR /app

# Install Wasp CLI
RUN npm install -g @wasp.sh/wasp-cli

# Copy app
COPY apps/app/ .

# Install dependencies
RUN wasp deps

# Build
RUN wasp build

# Production
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/.wasp/build ./build

ENV NODE_ENV=production
EXPOSE 3002

CMD ["node", "build/server/server.js"]
