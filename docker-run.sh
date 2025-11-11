#!/bin/bash

CONTAINER_NAME="team3-job-app-frontend"
IMAGE_NAME="team3-job-app-frontend"

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Container '$CONTAINER_NAME' already exists. Starting it..."
    docker start "$CONTAINER_NAME"
else
    echo "Container '$CONTAINER_NAME' does not exist. Creating and running it..."
    docker run -d \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        -p 3000:3000 \
        "$IMAGE_NAME"
fi

# Show logs
docker logs "$CONTAINER_NAME" -f
