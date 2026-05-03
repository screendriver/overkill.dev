export PATH := "./node_modules/.bin:" + env_var("PATH")

default:
	@just --list

build:
	vite build

format:
	prettier --log-level warn --write .

validate:
	prettier --check .
	just build

start:
	vite
