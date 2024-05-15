# Gbewa Kia API

An API for a logistics company, Gbewa Kia ("Bring it fast") that provides authentication, package sending, package tracking and automatic package updates.

## Documentation

The API documentation can be found [here](https://documenter.getpostman.com/view/19461169/2sA3JRYK8c)

## Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Use this command to copy the `.env.example` file to `.env` and set the environment variables
```bash
cp .env.example .env
```
4. Run `npm run dev` to start the server in development mode

> **Note:** You need to have a PostgreSQL database running on your machine. You can use Docker to run a PostgreSQL container. Use the following command to run a PostgreSQL container:
```bash
docker run --name gbewa-kia-db -e POSTGRES_USER=gbewa-kia -e POSTGRES_PASSWORD=gbewa-kia -e POSTGRES_DB=gbewa-kia -p 5432:5432 -d postgres
```

### Running with Docker

1. Run the following command to build the Docker image
```bash
docker build -t gbewa-kia-api .
```

2. Run the following command to run the Docker container
```bash
docker run --name gbewa-kia-api -p 8989:8989 --env-file .env -d gbewa-kia-api
```

## Technologies

- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT
- Postman
- Docker

## Author

- [Adeoluwa Adesola](https://www.linkedin.com/in/adeoluwa-adesola-dev/)

## License

This project is open source and available under the [MIT License](LICENSE).
