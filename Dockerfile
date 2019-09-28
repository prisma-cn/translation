FROM mhart/alpine-node

WORKDIR /app
COPY . .

ENV NODE_ENV=production

RUN yarn install &&\
  yarn build

CMD ["yarn","start"]⏎