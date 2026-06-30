# ── Havyn API ──────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Install dependencies first to leverage Docker layer caching.
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source.
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
