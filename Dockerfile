FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apk add --no-cache curl
# Add cron job script
RUN apk add --no-cache busybox-suid

RUN npm run build

# Create logs directory
RUN mkdir -p /app/logs

RUN echo "* * * * * /usr/bin/curl http://localhost:5000/api/rapid-bus-kl" >> /etc/crontabs/root
RUN echo "* * * * * /usr/bin/curl http://localhost:5000/api/rapid-bus-penang" >> /etc/crontabs/root
RUN echo "* * * * * /usr/bin/curl http://localhost:5000/api/rapid-bus-kuantan" >> /etc/crontabs/root
RUN echo "* * * * * /usr/bin/curl http://localhost:5000/api/rapid-bus-mrtfeeder" >> /etc/crontabs/root
RUN echo "* * * * * /usr/bin/curl http://localhost:5000/api/mybas-johor" >> /etc/crontabs/root
RUN echo "* * * * * /usr/bin/curl http://localhost:5000/api/ktmb" >> /etc/crontabs/root

# For 30 seconds interval
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/rapid-bus-kl )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/rapid-bus-penang )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/ktmb )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/mybas-johor )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/rapid-bus-mrtfeeder )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/rapid-bus-kuantan )" >> /etc/crontabs/root

VOLUME ["/app/logs"]

CMD ["sh", "-c", "crond && npm run start"]
