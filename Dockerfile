FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Explicitly install busybox-suid and dcron for ARM64 compatibility
RUN apk add --no-cache curl busybox-suid dcron

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

# Create cron directory
RUN mkdir -p /var/spool/cron/crontabs && \
    chown -R root:root /var/spool/cron/crontabs && \
    chmod 1730 /var/spool/cron/crontabs

USER node

# Modified CMD to ensure crond starts properly
CMD ["sh", "-c", "sudo crond -f -l 8 && npm run start"]
