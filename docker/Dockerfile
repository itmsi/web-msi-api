# Multi-stage build untuk optimasi ukuran image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (menggunakan npm install untuk kompatibilitas yang lebih baik)
RUN npm install --only=production && npm cache clean --force

# Production stage
FROM node:22-alpine AS production

# Create app user untuk security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    chown -R nodejs:nodejs logs && \
    chmod -R 755 logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 9501

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9501/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start application
CMD ["node", "src/server.js"]