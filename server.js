require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const fetch   = (...a) => import('node-fetch').then(({default:f}) => f(...a));
const Stripe  = require('stripe');

const app        = express();
const PORT       = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

/* storage for uploads */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads/'),
  filename   : (_, file, cb) =>
    cb(null, Date.now() + '-' + Math.round(Math.random()*1e9) + path.extname(file.originalname))
});
const upload = multer({ storage });

/* Health-check */
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', time: Date.now() }));

/* Upload + «очистка» (демо) */
app.post('/api/clean', upload.single('audio'), async (req, res) => {
  const filePath = req.file.path;
  console.log('Uploaded:', filePath);

  /* TODO: Dolby / RNNoise здесь */
  await new Promise(r => setTimeout(r, 1500));     // имитация обработки

  res.json({ url: `${CLIENT_URL}/download/${path.basename(filePath)}` });
});

/* отдаём обработанные файлы (демо) */
app.use('/download', express.static(path.join(__dirname, 'uploads')));

/* Stripe */
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: 10,          // €0.10
          product_data: {
            name: 'NoiseGone premium minutes',
            description: '1 additional cleaned minute'
          }
        },
        quantity: req.body.quantity || 1
      }],
      success_url: CLIENT_URL + '/success',
      cancel_url : CLIENT_URL + '/cancel'
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Stripe error' });
  }
});

app.listen(PORT, () => console.log('Server on', PORT));
