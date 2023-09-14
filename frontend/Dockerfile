FROM node:alpine
WORKDIR /app
RUN chown -R node /app
COPY ./package*.json ./
RUN npm install
RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

COPY . ./

EXPOSE 3000
CMD ["npm","start"]