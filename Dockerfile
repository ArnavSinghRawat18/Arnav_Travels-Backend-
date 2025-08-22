FROM node:22-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (use package-lock if present)
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Set environment
ENV NODE_ENV=production

# Use the start script from package.json
CMD ["npm", "start"]
