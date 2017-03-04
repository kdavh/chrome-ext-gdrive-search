NAME := chr-ext-gdrive-search

# rebuild in case Dockerfile changes
build:
	docker-compose --project-name ${NAME} build

run:
	docker-compose --project-name ${NAME} run -p 3000:3000 -p 3001:3001 --rm server

test:
	docker-compose --project-name ${NAME} run -p 4000:3000 -p 4001:3001 --rm server npm test

sh:
	docker-compose --project-name ${NAME} run -p 5000:3000 -p 5001:3001 --rm server bash
