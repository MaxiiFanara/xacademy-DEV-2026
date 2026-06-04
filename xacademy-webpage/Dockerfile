# ---- STAGE 1: Build ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# ---- STAGE 2: Serve con Nginx ----
FROM nginx:alpine
COPY --from=builder /app/dist/xacademy-webpage/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80