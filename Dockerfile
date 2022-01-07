FROM node:16
ENV NODE_ENV=production
RUN mkdir -p /var/www/files
WORKDIR /var/www/files
ADD . /var/www/files
RUN yarn install
CMD yarn build && yarn start:prod
