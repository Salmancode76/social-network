# STEP 1: Use Node.js base image
FROM node:18-alpine

# STEP 2: Set working directory
WORKDIR /app

# STEP 3: Copy package files
COPY package.json package-lock.json ./

# STEP 4: Install dependencies
RUN npm install

# STEP 5: Copy rest of the code
COPY . .

# STEP 6: Build the app (for production)
RUN npm run build

# STEP 7: Expose the port (default Next.js port)
EXPOSE 3000

# STEP 8: Start the app (for production)
CMD ["npm", "run" , "start"]
