# NoiseGone

NoiseGone — онлайн-сервис для очистки аудио от фонового шума.

## Локальный запуск

```bash
# backend
cd server
cp .env.example .env        # вставь STRIPE_SECRET_KEY
npm install
npm start                   # 4000

# frontend
cd ../client
npm install
npm run dev                 # 5173
