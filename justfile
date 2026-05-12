export PATH := "./node_modules/.bin:" + env_var("PATH")
export NODE_OPTIONS := "--max-old-space-size=4096"

default:
	@just --list

format:
	prettier --log-level warn --write .

sync:
	astro sync --force

compile: sync
	tsc

lint: sync
	astro check --minimumFailingSeverity=hint
	prettier --check .
	eslint . --cache --cache-location "./target/eslintcache" --cache-strategy content --max-warnings 0

test-unit:
	vitest run

test: compile lint test-unit build

develop:
	astro dev

build:
	astro build
