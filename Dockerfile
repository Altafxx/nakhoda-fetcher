FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Install required packages including sudo
RUN apk add --no-cache curl busybox-suid dcron sudo

# Configure sudo for node user
RUN echo "node ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/node && \
    chmod 0440 /etc/sudoers.d/node

# Add this line to regenerate Prisma Client
RUN npx prisma generate

RUN npm run build

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    touch /app/logs/cron.log && \
    chown -R node:node /app/logs && \
    chmod -R 777 /app/logs && \
    chmod 666 /app/logs/cron.log

# Set up cron
COPY crontab /etc/crontabs/root
RUN chmod 600 /etc/crontabs/root && \
    chown root:root /etc/crontabs/root && \
    mkdir -p /var/spool/cron/crontabs && \
    chmod 1730 /var/spool/cron/crontabs && \
    touch /var/log/cron.log && \
    chmod 666 /var/log/cron.log

# Set permissions for proxies.json
RUN mkdir -p /app/src/config && \
    touch /app/src/config/proxies.json && \
    chown node:node /app/src/config/proxies.json && \
    chmod 666 /app/src/config/proxies.json

USER node

# Add sudo to PATH for node user
ENV PATH="/usr/bin:${PATH}"

# Start cron and application
CMD ["sh", "-c", "sudo touch /app/logs/cron.log && sudo chmod 666 /app/logs/cron.log && sudo crond -f -l 8 & npm run start"]
