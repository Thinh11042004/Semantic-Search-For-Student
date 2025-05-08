FROM node:18

WORKDIR /app

COPY package*.json ./

# Clean install dependencies
RUN rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
