# STEP 1: Use Go 1.23 with Alpine
FROM golang:1.23-alpine

# STEP 2: Set working directory
WORKDIR /app

# STEP 3: Copy Go module files first
COPY go.mod ./
COPY go.sum ./

# STEP 4: Download dependencies
RUN go mod download

# STEP 5: Copy the rest of the source code
COPY . .

# STEP 6: Build the Go app from cmd/ folder
RUN go build -o main ./cmd

# STEP 7: Expose the port (change if your app uses different port)
EXPOSE 8080

# STEP 8: Run the app
CMD ["./main"]
