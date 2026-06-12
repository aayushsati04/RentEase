import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummykeysecret456'
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { bookingId, amount, paymentMethod } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ success: false, message: 'Missing booking ID or amount' });
  }

  try {
    // 1. Fetch tenant ID and booking status from Supabase
    const { data: booking, error: bkErr } = await supabase
      .from('bookings')
      .select('tenant_id, status, property_id')
      .eq('id', bookingId)
      .single();

    if (bkErr || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['cancelled', 'rejected', 'completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot pay for a booking with status '${booking.status}'` });
    }

    // 2. Create Razorpay Order
    let razorpayOrder;
    const isDummyKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_dummykeyid123';

    if (isDummyKey) {
      razorpayOrder = {
        id: `order_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: bookingId.toString()
      };
    } else {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        receipt: bookingId.toString()
      });
    }

    // 3. Create a pending payment log in Supabase
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        tenant_id: booking.tenant_id,
        amount: Number(amount),
        payment_method: paymentMethod || 'card',
        payment_status: 'pending',
        transaction_id: razorpayOrder.id
      })
      .select()
      .single();

    if (payErr) {
      throw new Error(`Failed to create payment record in database: ${payErr.message}`);
    }

    const paymentObj = {
      ...payment,
      _id: payment.id,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123'
    };

    return res.status(201).json({
      success: true,
      message: 'Payment session initiated successfully',
      data: paymentObj
    });

  } catch (err) {
    console.error('Create payment error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}
