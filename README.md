# Help Desk

Recovered NestJS help-desk backend using in-memory mock data.

## Run

```bash
npm --prefix backend install
npm run start:dev
```

The API starts on `http://localhost:3000`.




## Endpoints

- `GET /` — health greeting
- `GET /inventory` — quantity-based inventory mock data
- `GET /assets` — detailed asset mock data
- `GET /stockroom` — simple stockroom mock data
- `GET /tickets` — ticket mock data
- `POST /tickets` — logs and echoes submitted JSON; it does not persist it

This checkpoint intentionally has no database.
