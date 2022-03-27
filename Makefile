DOCKER_FILE_DEV := ./docker/Dockerfile.dev
DOCKER_APP_NAME := task-management-app
DOCKER_DEV := -f docker-compose-dev.yml
DOCKER_DEV_EXEC := ${DOCKER_DEV} exec ${DOCKER_APP_NAME}
DOCKER_IMAGES_DEV := app-task-management-dev:latest

install:
	npm install

build:
	npm run build

dev:
	npm run start:dev

lint:
	npm run lint

docker-run-dev-build:
	docker build -f ${DOCKER_FILE_DEV} -t ${DOCKER_IMAGES_DEV} .

docker-run-dev:
	docker-compose ${DOCKER_DEV} up -d

docker-run-dev-stop:
	docker-compose ${DOCKER_DEV} down

docker-run-dev-test:
	docker-compose ${DOCKER_DEV_EXEC} npm run test