export PATH := "./node_modules/.bin:" + env_var("PATH")

default:
	@just --list

format:
	prettier --log-level warn --write .

check: sync
	astro check --minimumFailingSeverity=hint

sync:
	astro sync --force

compile: sync
	tsc

lint: check
	prettier --check .

test-unit:
	node --test "source/**/*.test.ts"

test: compile lint test-unit build

develop:
	astro dev

build:
	astro build
