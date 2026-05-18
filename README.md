# GoRide Backend

Backend simples para o GoRide. Por enquanto, ele tem apenas o CRUD de caronas,
que e a parte que o front precisa primeiro.

## Como rodar

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependencias:

```bash
npm install
```

Crie/atualize o banco local e gere o Prisma Client:

```bash
npm run prisma:push
npm run prisma:generate
```

Coloque alguns dados de teste:

```bash
npm run prisma:seed
```

Suba a API:

```bash
npm run dev
```

A API fica em:

```txt
http://localhost:3000
```

## Rotas

```txt
GET    /health       testa se a API esta ligada
GET    /rides        lista caronas
GET    /rides/:id    busca uma carona especifica
POST   /rides        cria uma carona
PUT    /rides/:id    edita uma carona
DELETE /rides/:id    remove uma carona
```

## Exemplo para criar carona

```json
{
  "driverId": "user-1",
  "origin": "Jatiuca",
  "destination": "UFAL - Campus A.C. Simoes",
  "date": "2026-05-20",
  "departureTimeStart": "07:30",
  "departureTimeEnd": "08:00",
  "price": 6.5,
  "totalSeats": 3,
  "sameGenderOnly": false
}
```

## Filtros da listagem

A rota `GET /rides` aceita alguns filtros pela URL:

```txt
origin
destination
date
timeStart
timeEnd
maxPrice
sameGenderOnly
driverId
status
```

Exemplo:

```txt
GET /rides?origin=Jatiuca&date=2026-05-20
```

## Observacoes

Ainda nao tem login, solicitacao de carona, chat ou avaliacao. O `driverId`
por padrao fica como `user-1`, que vem do seed.
