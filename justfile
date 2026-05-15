export PATH := "./node_modules/.bin:" + env_var("PATH")

default:
	@just --list

develop:
	vite dev

preview: build
	vite preview

build:
	vite build

lint:
	prettier --check .

lint-fix:
	prettier --write .

test:
	node --test tests/*.test.js
