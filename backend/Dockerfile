FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev    # skip devDependencies in production

COPY . .

EXPOSE 5000
CMD ["node", "src/server.js"]