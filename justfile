export PATH := "./node_modules/.bin:" + env_var("PATH")

default:
	@just --list

format:
	prettier --log-level warn --write .

validate:
	prettier --check .
	just build

develop:
	vite

build:
	vite build
