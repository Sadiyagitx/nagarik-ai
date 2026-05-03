# ════════════════════════════════════════════════════════════
# Stage 1 — Build
# ════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ════════════════════════════════════════════════════════════
# Stage 2 — Serve
# Final image is ~25 MB (nginx:alpine only)
# ════════════════════════════════════════════════════════════
FROM nginx:stable-alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (Cloud Run listens on 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config that conflicts
RUN rm -f /etc/nginx/conf.d/default.conf.bak 2>/dev/null || true

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
