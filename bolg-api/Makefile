.PHONY: build run clean migrate seed dev

build:
	go build -o bin/server cmd/server/main.go

run: build
	./bin/server

dev:
	go run cmd/server/main.go

clean:
	rm -rf bin/

migrate:
	mysql -u root < migrations/001_init.sql

tidy:
	go mod tidy

fmt:
	go fmt ./...

lint:
	golangci-lint run

test:
	go test ./...
