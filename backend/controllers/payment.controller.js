import * as paymentService from '../services/payment.service.js';
import * as feeService from '../services/fee.service.js';

export const initiatePayment = async (req, res, next) => {
  try {
    const { demand_id } = req.body;
    const studentId = req.user.studentId;
    const demand = await feeService.getStudentDemandById(demand_id);
    if (!demand) return res.status(404).json({ error: 'Demand not found' });
    if (demand.student_id !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { order, payment } = await paymentService.createPaymentOrder(
      demand_id,
      studentId,
      demand.due_amount // or demand.total_amount - demand.paid_amount
    );
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      payment_id: payment.id,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { payment_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const isValid = paymentService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update payment record
    const updated = await paymentService.markPaymentSuccess(
      payment_id,
      razorpay_payment_id,
      razorpay_signature
    );

    res.json({ success: true, payment: updated });
  } catch (err) {
    next(err);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    await paymentService.handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};