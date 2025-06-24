# Use official Go image with CGO support (required for sqlite3)
FROM golang:1.23

# Set working directory to /app/cmd so ../internal/... matches
WORKDIR /app/cmd

# Copy go.mod and go.sum first (for better caching)
COPY go.mod go.sum /app/
RUN cd /app && go mod download

# Copy the whole backend project into /app
COPY . /app/

# Build from inside cmd folder
RUN go build -o main .

# Expose the backend port
EXPOSE 8080

# Run the built backend binary
CMD ["./main"]