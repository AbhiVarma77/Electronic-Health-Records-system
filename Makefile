

# Build and bring up all the containers
up:
	docker-compose up 

# Stop all the containers
stop:
	docker-compose stop

# Remove all the containers
rm:
	docker-compose rm 

# Stop & remove all the containers 
srm:
	docker-compose down 

# Stop & remove all the containers along with images
rmi:
	docker-compose down --rmi all


