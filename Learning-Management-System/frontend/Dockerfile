# ---------- Build stage ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Inject the backend URL at build time (CRA bakes env vars into the build)
ARG REACT_APP_API_BASE_URL=http://localhost:8080
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Runtime stage (nginx serves static build) ----------
FROM nginx:1.27-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
