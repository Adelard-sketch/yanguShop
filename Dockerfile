FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Use environment port with fallback
ENV PORT=4000
EXPOSE 4000

CMD ["npm", "start"]
