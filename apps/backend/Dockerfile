ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine

WORKDIR /app

# Set default runtime port
ENV PORT=3001

COPY package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node src ./src

USER node
EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

CMD ["node", "src/server.js"]
