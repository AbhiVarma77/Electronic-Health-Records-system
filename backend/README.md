# EHRS Backend

## Prerequisites

- Node.js >= 18

  [TODO: 1. Add recommended installation with nvm, 2. Add link to installation docs]

  ```sh
  # For Debian and Debian based operating systems, Installing NodeJS with PPA.

  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
  sudo apt-get install -y nodejs

  ```

- pnpm

  ```sh
  npm install --location=global pnpm
  ```

- nodemon

  ```sh
  npm install --location=global nodemon
  ```

- Docker and Docker compose (optional)

  - Install `docker` (Skip this step, if it's already installed)

    ```sh
    # Remove older version
    sudo apt-get remove docker docker-engine docker.io containerd runc

    sudo apt-get update
    sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release

    # Download GPG Key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update

    sudo apt-get install docker-ce docker-ce-cli containerd.io

    # Ensure user is added to docker group
    sudo usermod -a -G docker $USER

    docker run hello-world
    ```

  - Install `docker-compose`

    ```sh
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

    sudo chmod +x /usr/local/bin/docker-compose
    ```

  - run the docker image
    ```bash
    docker-compose up -d postgres
    ```
  - execute bash in the postgres container
    ```bash
    docker exec -it postgres bash
    ```

- postgres (optional)
  - login to postgres with the username and connect to the database
    ```bash
    psql -U postgres -d ehrs
    ```
  - quit - `\q`
  - list all tables with additional info - `\dt+`
  - describe the structure of the table `\d users`
    [Read more...](https://www.postgresqltutorial.com/postgresql-cheat-sheet/)

## Getting Started

- Install all dependencies using
  ```sh
  pnpm i
  ```
- Either setup a postgres instance locally using docker-compose or use a cloud hosted postgres instance. Go to (https://neon.tech/) and create an account and create a PostgreSQL instance and copy the url given there.

- Create .env file by copying .env.sample
  ```sh
  cp .env.sample .env
  ```
- Update the .env `DATABASE_URL` with postgres instance url from your PostgreSQL URL

- Create the prisma client locally
  ```sh
  npx prisma generate
  ```
- Migration to db
  ```sh
  npx prisma db push
  ```
- Push the latest schema changes against the database
  ```sh
  npx prisma db push
  ```
- To view db
  ```sh
  npx prisma studio
  ```
- Add some test data to the database
  ```sh
  pnpm db:seed
  ```

- Run the application
  ```sh
  nodemon index.js

- DB reset

```
npx prisma migrate reset
```
Note: After db reset you need to again run `npx prisma db push`.

  ```

## Code Structure

- This project doesn't follow a strict MVC pattern
- `routes` folder contains endpoints specific to each model in prisma schema
- Each endpoint is simply a function that executes code specific to that endpoint
- Any reusable or utility functions will be under `utils` folder
- All endpoints has to declare endpoint schema which include request parameters, request headers, response body, response status codes etc.,

## Tutorials and Documentation

- A primer on Fastify, Zod and Prisma. The video is a bit outdated but the core ideas remain the same - https://www.youtube.com/watch?v=LMoMHP44-xM
- Prisma Documentation - https://www.prisma.io/docs
- Fastify Documentation - https://www.fastify.io/docs/latest/
