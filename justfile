export PATH := "./node_modules/.bin:" + env_var("PATH")

default:
	@just --list

build:
	vite build --outDir target

format:
	prettier --log-level warn --write .

validate:
	prettier --check .
	just build

start:
	vite --host 127.0.0.1 --port 4321

docker-build:
	just build
	docker build -t overkill.dev:local .
