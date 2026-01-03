# Use Node.js base image
FROM node:20-slim

# Install Python 3 and pip (required for backend)
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Set working directory to root
WORKDIR /app

# Copy dependency files first for caching
COPY backend/requirements.txt ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Install Python dependencies
# --break-system-packages is needed on newer Debian/Ubuntu versions included in Node images
RUN pip3 install -r backend/requirements.txt --break-system-packages

# Install Node dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy the rest of the application code
WORKDIR /app
COPY . .

# Build the Next.js application
WORKDIR /app/frontend
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
