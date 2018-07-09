bootstrap:
	bash ./bootstrap.sh -d="$(PROJECTS_DIR)" -p="$(PROJECT_NAME)"
	node index.js --config projects-config.json

project-build:
	bash ./bootstrap.sh -d="$(PROJECTS_DIR)" -p="$(PROJECT_NAME)" --deploy="$(DEPLOY)"

docker-build:
	docker build -f docker/Dockerfile -t booben:latest .
