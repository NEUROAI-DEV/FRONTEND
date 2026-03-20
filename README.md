# NEUROAI Frontend

Frontend app built with React + TypeScript + Vite.

## Requirements

- Node.js 20+
- npm 9+

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open:

`http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Run with Docker (Development)

1. Build and start container:

```bash
docker compose up --build
```

2. Open:

`http://localhost:5173`

3. Stop container:

```bash
docker compose down
```

## Run with Docker (Production Image)

Build and run nginx static image:

```bash
docker build -t neuroai-frontend:prod --target production .
docker run --rm -p 8080:80 neuroai-frontend:prod
```

Open:

`http://localhost:8080`
