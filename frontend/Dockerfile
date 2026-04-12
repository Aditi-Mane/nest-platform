# ── Stage 1: Build the React app ──────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install                   # ci is faster + deterministic vs npm install

COPY . .
RUN npm run build             # outputs to /app/dist (Vite) or /app/build (CRA)

# ── Stage 2: Serve with nginx ─────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# If using Create React App, change /app/dist → /app/build above

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]