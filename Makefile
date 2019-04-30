install:
	npm install

lint:
	npx eslint .

build:
	npx webpack

run-dev-server:
	npx webpack-dev-server --open