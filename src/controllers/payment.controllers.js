import express from 'express'
import prisma from '../utils/prisma.js'
import stripe from 'stripe';

const stripeClient = stripe(process.env.STRIPE_KEY);
const frontendUrl = process.env.FE_URL;
const router = express.Router()

router.post('/', async (req, res) => {
  const { imageId } = req.body; // Assuming the imageId is sent in the request body
  // console.log('Request Body:', req.body);

  try {
    const imageDetails = await prisma.image.findUnique({
        where: {
          id: imageId
        }
      });
    if (imageDetails) {
      // Create the line items for the checkout session
      const lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: imageDetails.title,
              description: imageDetails.description,
            },
            unit_amount: imageDetails.price * 100 // Convert price to cents
          },
          quantity: 1,
        }
      ];
      // Create a Stripe checkout session
      const session = await stripeClient.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: frontendUrl + '/payment/success/' + imageId, // Replace with your success URL
        cancel_url: frontendUrl + '/payment/cancel' // Replace with your cancel URL
      });
      return res.json(session.url);
      
    } else {
      // Image details not found
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    // Error occurred during the database query or Stripe session creation
    console.error('Error initiating checkout:', error);
    res.status(500).json({ error: 'Failed to initiate checkout' });
  }
});

export default router