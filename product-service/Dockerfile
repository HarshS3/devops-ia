FROM node:14.0.0-alpine
WORKDIR /app
USER root
RUN cd /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
