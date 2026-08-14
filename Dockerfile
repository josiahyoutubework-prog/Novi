# Novi — single-image deploy: build the React frontend, then run the Express
# server which serves both the API and the built frontend on one port.

# --- Stage 1: build the frontend ---
FROM node:22-slim AS web
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# --- Stage 2: runtime ---
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev
COPY server/ ./server/
COPY --from=web /app/web/dist ./web/dist
# Render/Railway/Fly inject PORT; the server reads process.env.PORT.
EXPOSE 4000
CMD ["node", "server/index.js"]
