# Stage 1: Build Angular app
FROM node:20-alpine AS build

WORKDIR /app

# Install deps first for better layer caching.
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy project and build production bundle.
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve static files with nginx
FROM nginx:1.27-alpine AS runtime

# Replace default nginx site with SPA-aware config.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular build output.
COPY --from=build /app/dist/ai-pr-review-frontend /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
