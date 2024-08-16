# Define variables
DOCKER_IMAGE_NAME := ehrs-backend
DOCKER_FILE := Dockerfile
DOCKER_BUILD_ARGS := --no-cache

# Build Docker image
build:
	docker build $(DOCKER_BUILD_ARGS) -t $(DOCKER_IMAGE_NAME) -f $(DOCKER_FILE) .

# Run Docker image
run:
	docker run $(DOCKER_IMAGE_NAME) 

# Clean up Docker images
clean:
	docker rmi $(DOCKER_IMAGE_NAME)

# Exec inside the container
exec:
	docker -it exec $(DOCKER_IMAGE_NAME) -- /bin/sh

# Check the logs of the container
logs:
	docker logs $(DOCKER_IMAGE_NAME)

# Get the live logs of the container
flogs:
	docker -f logs $(DOCKER_IMAGE_NAME)