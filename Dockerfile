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

# Create logs directory
RUN mkdir -p /app/logs && chown node:node /app/logs && chmod 755 /app/logs

# Create log file and set permissions before adding cron jobs
RUN touch /app/logs/cron.log && chown node:node /app/logs/cron.log && chmod 644 /app/logs/cron.log

COPY crontab /etc/crontabs/root

# Ensure crontabs directory has correct permissions
RUN chmod 600 /etc/crontabs/root

# Create cron directory
RUN mkdir -p /var/spool/cron/crontabs && \
    chown -R root:root /var/spool/cron/crontabs && \
    chmod 1730 /var/spool/cron/crontabs

RUN mkdir -p /app/src/config && \
    touch /app/src/config/proxies.json && \
    chown node:node /app/src/config/proxies.json && \
    chmod 666 /app/src/config/proxies.json

# Create a startup script and set permissions before changing user
COPY <<'EOF' /app/startup.sh
#!/bin/sh
echo "Starting crond..."
sudo crond -f -l 8 &

echo "Starting Node.js application..."
npm run start &

echo "Waiting for server to be ready..."
until curl -s http://localhost:5000/api/proxy > /dev/null 2>&1; do
    echo "Server is not ready yet... retrying in 2 seconds"
    sleep 2
done

echo "Server is ready! Refreshing proxies..."
curl -s http://localhost:5000/api/refresh-proxies
echo "Proxy refresh completed"

# Keep the container running
wait
EOF

RUN chmod +x /app/startup.sh && \
    chown node:node /app/startup.sh

USER node

# Add sudo to PATH for node user
ENV PATH="/usr/bin:${PATH}"

CMD ["/app/startup.sh"]
