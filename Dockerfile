FROM node:22

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Install necessary system dependencies for Puppeteer and Chromium
RUN apt-get update && apt-get install -y \
    curl gnupg \
    chromium \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN npm install
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

CMD ["npm", "start"]

EXPOSE 8080
