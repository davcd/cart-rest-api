# Cart REST API

This is a simple Cart REST API built with [node.js](https://nodejs.org/), [express.js](https://expressjs.com/) and [docker](https://www.docker.com/).

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture](#architecture)

## Getting Started

1. Clone this git repository:

```bash
git clone https://github.com/davcd/cart-rest-api
cd cart-rest-api
```

2. Configure your `.env` file
3. Run the API with docker-compose :

```bash
docker-compose up
```

4. Retrieve test logs

```bash
docker logs -f cart-rest-api_test_1
```

5. Test API with [Postman](https://www.getpostman.com/) (See collection and environment files on `/docs` folder)

## Architecture

<p align="center"><img src="docs/architecture.png" width="80%"/></p>
