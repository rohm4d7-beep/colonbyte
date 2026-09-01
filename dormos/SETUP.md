# DormOS — Run With One Command

Your machine only needs **Docker Desktop** (free). No Node.js, no PostgreSQL, no manual setup.

## 1. Install Docker Desktop

Download from https://www.docker.com/products/docker-desktop/ and install.

- **Windows:** during install, tick "Use WSL 2 instead of Hyper-V" and let it restart when asked.
- After installing, open **Docker Desktop** once and wait until it says "Engine running".

## 2. Start DormOS

Open a terminal in this folder and run:

```
docker compose up --build
```

The first run takes **2–5 minutes** (it downloads and builds everything once). Later starts are just:

```
docker compose up
```

## 3. Open the app

- App: **http://localhost:3000**
- API docs (Swagger): **http://localhost:3001/docs**
- Login: `aqdaspookie@gmail.com` / `aqdaspookiezindabaD27`

## Other commands

| Want to...                | Run                        |
| ------------------------- | -------------------------- |
| Stop the app              | `docker compose down`      |
| Start it again            | `docker compose up`        |
| Reset the database (fresh) | `docker compose down -v && docker compose up --build` |
| See logs                  | `docker compose logs -f`   |
