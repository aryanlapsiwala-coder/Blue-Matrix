# ==========================================
# KnowPass AI Backend Dockerfile (Node.js 20)
# ==========================================

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy server source
COPY . .

# Expose port (Railway dynamically injects PORT)
ENV PORT=5000
EXPOSE 5000

# Start production server
CMD ["node", "index.js"]
