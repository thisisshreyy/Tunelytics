# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies using package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine

# Clean default static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built application from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
