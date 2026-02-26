import Razorpay from 'razorpay';
import { supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order and insert a pending payment record
 */
export const createPaymentOrder = async (demandId, studentId, amount) => {
  // 1. Create order on Razorpay
  const options = {
    amount: amount * 100, // in paise
    currency: 'INR',
    receipt: `demand_${demandId}`,
  };
  const order = await razorpay.orders.create(options);

  // 2. Insert payment record in our database
  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      demand_id: demandId,
      student_id: studentId,
      amount,
      payment_method: 'upi', // default, will be updated after verification
      status: 'initiated',
      transaction_id: order.id, // store Razorpay order ID as transaction_id
      gateway_order_id: order.id,
      initiated_at: new Date(),
    })
    .select()
    .single();

  if (error) throw error;
  return { order, payment: data };
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  return expectedSignature === signature;
};

/**
 * Update payment status to success after verification
 */
export const markPaymentSuccess = async (paymentId, razorpayPaymentId, razorpaySignature) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'success',
      gateway_payment_id: razorpayPaymentId,
      gateway_signature: razorpaySignature,
      paid_at: new Date(),
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Handle Razorpay webhook (optional)
 */
export const handleWebhook = async (payload, signature) => {
  // Verify webhook signature using your webhook secret
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new Error('Invalid webhook signature');
  }

  const event = payload.event;
  if (event === 'payment.captured') {
    const payment = payload.payload.payment.entity;
    // Find our payment record by order_id
    const { data: existing } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('gateway_order_id', payment.order_id)
      .single();

    if (existing) {
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'success',
          gateway_payment_id: payment.id,
          paid_at: new Date(),
        })
        .eq('id', existing.id);
    }
  }
};