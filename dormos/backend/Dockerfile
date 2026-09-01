FROM node:20-slim

WORKDIR /app

ARG DATABASE_URL=postgresql://dormos:dormos@postgres:5432/dormos?schema=public
ENV DATABASE_URL=$DATABASE_URL

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma

RUN npm ci \
  && npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3001

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
