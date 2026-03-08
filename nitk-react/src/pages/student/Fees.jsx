import { useState } from 'react';
import { StatCard, Card, CardHeader, CardBody, Badge, Button } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import * as studentApi from '../../services/studentApi';
import * as commonApi from '../../services/commonApi';
import { LoadingState, ErrorState } from '../../components/ui/StateDisplays';
import { stagger, showToast } from '../../components/ui/animations';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function Fees() {
  const { data: feeData, loading: feeLoading, error: feeError, refetch: refetchFees } = useApi(studentApi.getFees);
  const { data: payments, loading: paymentsLoading } = useApi(studentApi.getPayments);
  const [payingLoading, setPayingLoading] = useState(false);

  const loading = feeLoading || paymentsLoading;
  if (loading) return <LoadingState message="Loading fee details..." />;
  if (feeError) return <ErrorState message={feeError} onRetry={refetchFees} />;

  const fee = feeData || {};
  const feeBreakdown = fee.breakdown || [
    { name: 'Tuition Fee', amount: 48000 },
    { name: 'Development Fee', amount: 3500 },
    { name: 'Exam Fee', amount: 2500 },
  ];
  const totalDemand = fee.total || feeBreakdown.reduce((s, f) => s + (f.amount || 0), 0);
  const amountPaid = fee.paid || 0;
  const pending = fee.due || (totalDemand - amountPaid);
  const status = fee.status || (amountPaid >= totalDemand ? 'paid' : 'pending');

  const pieData = [
    { name: 'Paid', value: amountPaid || 1, color: '#2DD4A0' },
    { name: 'Pending', value: pending || 1, color: '#FF4F6D' },
  ];

  const paymentHistory = (payments || []).map(p => ({
    id: p.id || p.transaction_id,
    date: p.date || (p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'),
    amount: p.amount || '-',
    mode: p.mode || p.payment_method || '-',
    status: p.status || '-',
  }));

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    if (!fee || status === 'paid') return;
    setPayingLoading(true);
    try {
      showToast('Initiating payment...', 'info');
      
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        showToast('Razorpay SDK failed to load. Are you online?', 'error');
        setPayingLoading(false);
        return;
      }

      // Initiate order on backend
      const { order_id, amount, currency, payment_id } = await commonApi.initiatePayment(fee.id);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock', // Replace with actual key in env
        amount: amount,
        currency: currency,
        name: 'NITK Payment Gateway',
        description: 'Semester Fee Payment',
        order_id: order_id,
        handler: async function (response) {
          try {
            showToast('Verifying payment...', 'info');
            await commonApi.verifyPayment({
              payment_id: payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            showToast('Payment successful!', 'success');
            refetchFees(); // Refresh the page data
          } catch (err) {
            showToast('Payment verification failed', 'error');
          }
        },
        prefill: {
          name: 'Student', // Ideally fetched from profile
          email: 'student@nitk.ac.in',
        },
        theme: {
          color: '#F97316' // Orange to match our theme
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      showToast('Payment initiation failed. Try again.', 'error');
    } finally {
      setPayingLoading(false);
    }
  };

  return (
    <motion.div className="space-y-5" variants={stagger.container} initial="hidden" animate="show">
      <motion.div className="grid grid-cols-4 gap-4" variants={stagger.item}>
        <StatCard label="Total Demand" value={`₹${totalDemand.toLocaleString('en-IN')}`} sub={fee.dueDate ? `Due: ${new Date(fee.dueDate).toLocaleDateString()}` : 'Current Semester'} color="var(--color-blue)" delay={0} />
        <StatCard label="Amount Paid" value={`₹${amountPaid.toLocaleString('en-IN')}`} sub="Total payments" color="var(--color-green)" delay={0.05} />
        <StatCard label="Pending" value={`₹${pending.toLocaleString('en-IN')}`} sub="Remaining amount" color="var(--color-orange)" delay={0.1} />
        <StatCard label="Status" value={status === 'paid' ? 'Paid' : 'Pending'} sub={status === 'paid' ? 'All dues cleared' : 'Payment due'} color={status === 'paid' ? 'var(--color-green)' : 'var(--color-red)'} delay={0.15} animate={false} />
      </motion.div>

      <motion.div className="grid grid-cols-[1fr_280px] gap-5" variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">💰 Fee Breakdown</h3>
            <Badge variant="blue">Current Semester</Badge>
          </CardHeader>
          <div>
            {feeBreakdown.map((f, i) => (
              <motion.div
                key={f.name || f.label || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex items-center justify-between border-b border-[var(--bd1)] px-5 py-3 last:border-b-0"
              >
                <span className="text-[13px] text-[var(--t2)]">{f.name || f.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] font-semibold">
                    ₹{(f.amount || 0).toLocaleString('en-IN')}
                  </span>
                  {f.waived && <Badge variant="green">Waived</Badge>}
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between border-t-2 border-[var(--bd2)] px-5 py-3.5"
            >
              <span className="text-[14px] font-bold">Net Payable</span>
              <span className="font-mono text-lg font-bold text-orange">₹{pending.toLocaleString('en-IN')}</span>
            </motion.div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardBody className="flex flex-col items-center gap-3 py-5">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={65} dataKey="value" startAngle={90} endAngle={-270} animationDuration={1200}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 text-center">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-[11px]">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-[var(--t2)]">{d.name}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {status !== 'paid' && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="primary" className="w-full justify-center py-3!" onClick={handlePay} disabled={payingLoading}>
                {payingLoading ? '⏳ Processing...' : `💳 Pay ₹${pending.toLocaleString('en-IN')} →`}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div variants={stagger.item}>
        <Card>
          <CardHeader>
            <h3 className="font-display text-[15px] font-bold">📜 Payment History</h3>
            <Badge variant="grey">{paymentHistory.length} transactions</Badge>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0!">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--bd1)]">
                  {['Transaction ID', 'Date', 'Amount', 'Mode', 'Status'].map((h) => (
                    <th key={h} className="bg-[var(--s3)] px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--t3)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p, i) => (
                  <motion.tr
                    key={p.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    whileHover={{ backgroundColor: 'var(--s3)' }}
                    className="border-b border-[var(--bd1)] transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-[11px]">{p.id}</td>
                    <td className="px-5 py-3 text-[12px] text-[var(--t2)]">{p.date}</td>
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{typeof p.amount === 'number' ? `₹${p.amount.toLocaleString('en-IN')}` : p.amount}</td>
                    <td className="px-5 py-3"><Badge variant="blue">{p.mode}</Badge></td>
                    <td className="px-5 py-3"><Badge variant={p.status === 'Success' || p.status === 'success' ? 'green' : 'amber'}>{p.status}</Badge></td>
                  </motion.tr>
                ))}
                {paymentHistory.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px] text-[var(--t3)]">No payment history</td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
