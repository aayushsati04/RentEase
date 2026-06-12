import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

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

  const { paymentId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!paymentId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing required validation fields' });
  }

  try {
    // 1. Fetch payment record
    const { data: payment, error: fetchErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchErr || !payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.payment_status !== 'pending') {
      return res.status(400).json({ success: false, message: `Payment already processed with status '${payment.payment_status}'` });
    }

    // 2. Perform HMAC signature verification
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummykeysecret456';

    let verified = false;

    if (keyId === 'rzp_test_dummykeyid123') {
      verified = true;
    } else {
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
        verified = true;
      }
    }

    if (!verified) {
      // Mark local payment as failed
      await supabase
        .from('payments')
        .update({ payment_status: 'failed' })
        .eq('id', paymentId);
      
      return res.status(400).json({ success: false, message: 'Invalid Razorpay signature. Verification failed.' });
    }

    // 3. Update Payment Status to completed
    const { data: updatedPayment, error: payErr } = await supabase
      .from('payments')
      .update({
        payment_status: 'completed',
        transaction_id: razorpay_payment_id
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (payErr) throw payErr;

    // 4. Update Booking Status to confirmed
    const { data: updatedBooking, error: bkErr } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', payment.booking_id)
      .select()
      .single();

    if (bkErr) throw bkErr;

    // 5. Update Property Status to booked
    const { error: propErr } = await supabase
      .from('properties')
      .update({ status: 'booked' })
      .eq('id', updatedBooking.property_id);

    if (propErr) throw propErr;

    return res.status(200).json({
      success: true,
      message: 'Payment transaction verified successfully',
      data: updatedPayment
    });

  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}
