# ── Havyn Web (multi-stage: build with Node, serve with nginx) ──
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# The app calls "/api" which nginx reverse-proxies to the API container,
# so no build-time API URL is required.
RUN npm run build

# ── Runtime ──
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
