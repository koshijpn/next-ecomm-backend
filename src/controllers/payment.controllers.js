import express from 'express';
import stripe from 'stripe';
const stripeKey = process.env.STRIPE_KEY;

const app = express();
const router = express.Router();
const stripeInstance = stripe('stripeKey');

router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripeInstance.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:4242/success',
      cancel_url: 'http://localhost:4242/cancel',
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = 4242;
app.use('/', router);
app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));


export default router;
