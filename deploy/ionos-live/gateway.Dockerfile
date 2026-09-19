FROM node:22-alpine
WORKDIR /app
COPY gateway/package.json ./package.json
RUN npm install --omit=dev --ignore-scripts
COPY gateway/ ./
RUN cp node_modules/hls.js/dist/hls.min.js public/hls.min.js
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
