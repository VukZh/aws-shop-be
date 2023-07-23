FROM node:15-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PRODUCTS=https://t00mw90bag.execute-api.eu-west-1.amazonaws.com
ENV CART=https://od25ml0dg5.execute-api.eu-west-1.amazonaws.com/api/profile
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/index"]