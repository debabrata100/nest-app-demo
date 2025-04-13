# Step 1: Use Node.js base image
FROM node:22-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the NestJS app
RUN npm run build

# Step 7: Expose the app on port 3000
EXPOSE 3000


# Step 8: Start the application
CMD ["npm", "run", "start:prod"]
