FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apk add --no-cache curl busybox-suid

# Add this line to regenerate Prisma Client
RUN npx prisma generate

RUN npm run build

# Create logs directory
RUN mkdir -p /app/logs && chown node:node /app/logs && chmod 755 /app/logs

# Create log file and set permissions before adding cron jobs
RUN touch /app/logs/cron.log && chown node:node /app/logs/cron.log && chmod 644 /app/logs/cron.log

# Add cron jobs with logging and staggered timing
RUN echo "* * * * * date >> /app/logs/cron.log 2>&1 && /usr/bin/curl -s http://localhost:5000/api/rapid-bus-kl >> /app/logs/cron.log 2>&1" >> /etc/crontabs/root
RUN echo "* * * * * sleep 10; date >> /app/logs/cron.log 2>&1 && /usr/bin/curl -s http://localhost:5000/api/rapid-bus-penang >> /app/logs/cron.log 2>&1" >> /etc/crontabs/root
RUN echo "* * * * * sleep 20; date >> /app/logs/cron.log 2>&1 && /usr/bin/curl -s http://localhost:5000/api/rapid-bus-kuantan >> /app/logs/cron.log 2>&1" >> /etc/crontabs/root
RUN echo "* * * * * sleep 30; date >> /app/logs/cron.log 2>&1 && /usr/bin/curl -s http://localhost:5000/api/rapid-bus-mrtfeeder >> /app/logs/cron.log 2>&1" >> /etc/crontabs/root
RUN echo "* * * * * sleep 40; date >> /app/logs/cron.log 2>&1 && /usr/bin/curl -s http://localhost:5000/api/mybas-johor >> /app/logs/cron.log 2>&1" >> /etc/crontabs/root
RUN echo "* * * * * sleep 50; date >> /app/logs/cron.log 2>&1 && /usr/bin/curl -s http://localhost:5000/api/ktmb >> /app/logs/cron.log 2>&1" >> /etc/crontabs/root

# Ensure crontabs directory has correct permissions
RUN chmod 600 /etc/crontabs/root

# For 30 seconds interval
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/rapid-bus-kl )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/rapid-bus-penang )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/ktmb )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/mybas-johor )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/rapid-bus-mrtfeeder )" >> /etc/crontabs/root
# RUN echo "* * * * * ( sleep 30; /usr/bin/curl http://localhost:3000/api/rapid-bus-kuantan )" >> /etc/crontabs/root

USER node

CMD ["sh", "-c", "crond -f -l 8 && npm run start"]
