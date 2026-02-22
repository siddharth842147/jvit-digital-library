import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Tabs, Tab, Form } from 'react-bootstrap';
import { FiDollarSign, FiCreditCard, FiInfo, FiSmartphone, FiHome, FiCopy } from 'react-icons/fi';
import { createPaymentOrder, verifyPayment, loadRazorpayScript, getAdminPaymentDetails, submitManualPayment } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [adminDetails, setAdminDetails] = useState(null);
    const [txnId, setTxnId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('online');

    const fineAmount = user?.totalFines || 0;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await getAdminPaymentDetails();
                if (response.success) setAdminDetails(response.data);
            } catch (err) {
                console.error('Failed to fetch admin payment details');
            }
        };
        fetchDetails();
    }, []);

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    const upiLink = adminDetails ? `upi://pay?pa=${adminDetails.upiId}&pn=${encodeURIComponent(adminDetails.upiName)}&am=${fineAmount}&cu=INR&tn=Library%20Fine` : '';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    const handleOnlinePayment = async () => {
        if (fineAmount <= 0) {
            toast.info('You have no pending fines to pay.');
            return;
        }

        try {
            setLoading(true);
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                return;
            }

            const orderResponse = await createPaymentOrder({ amount: fineAmount, type: 'fine', paymentMethod: 'razorpay' });
            if (!orderResponse.success) {
                toast.error(orderResponse.message || 'Failed to create payment order');
                return;
            }

            const { orderId, amount, currency } = orderResponse.data;

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_demo',
                amount: amount * 100,
                currency: currency,
                name: 'JVIT Digital Library',
                description: `Fine Payment for ${user?.name}`,
                image: '/logo.jpg',
                order_id: orderId,
                handler: async function (response) {
                    try {
                        const verifyResponse = await verifyPayment({
                            orderId,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            paymentMethod: 'razorpay'
                        });

                        if (verifyResponse.success) {
                            toast.success('Payment successful! Your fines have been cleared.');
                            navigate('/payment-history');
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch (error) {
                        toast.error('Error verifying payment');
                    }
                },
                prefill: { name: user?.name, email: user?.email, contact: user?.phone },
                theme: { color: '#065f46' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error('Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!txnId) return toast.error('Please enter Transaction ID');

        try {
            setSubmitting(true);
            const response = await submitManualPayment({
                amount: fineAmount,
                paymentType: 'fine',
                paymentMethod: activeTab === 'manual_upi' ? 'upi' : 'bank_transfer',
                transactionId: txnId,
                description: `Manual fine payment of ₹${fineAmount}`
            });

            if (response.success) {
                toast.success('Payment submitted for verification!');
                navigate('/payment-history');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '4rem 0', background: 'var(--bg-secondary)', minHeight: '90vh' }}>
            <Container>
                <div className="text-center mb-5">
                    <Badge bg="primary" className="mb-3 px-3 py-2">SECURE PAYMENT PORTAL</Badge>
                    <h1 style={{ fontWeight: 800 }}>Clear Your Dues</h1>
                    <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
                        Support your library by clearing outstanding fines. Choose from our modern automated system or manual transfer.
                    </p>
                </div>

                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className="border-0 shadow-lg" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                            <Row className="g-0">
                                <Col md={4} className="bg-primary text-white p-5 d-flex flex-column justify-content-center align-items-center text-center">
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                        <FiDollarSign size={48} />
                                    </div>
                                    <h6 className="text-uppercase opacity-75 fw-bold small mb-2">Total Outstanding</h6>
                                    <h2 className="display-4 fw-bold mb-0">₹{fineAmount}</h2>
                                    <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(0,0,0,0.1)', fontSize: '0.85rem' }}>
                                        <FiInfo className="me-2" />
                                        Clearing fines restores your borrowing privileges instantly.
                                    </div>
                                </Col>
                                <Col md={8} className="p-4 p-md-5">
                                    <Tabs
                                        activeKey={activeTab}
                                        onSelect={(k) => setActiveTab(k)}
                                        className="mb-4 custom-tabs"
                                        justify
                                    >
                                        <Tab eventKey="online" title={<span><FiCreditCard className="me-2" />Online</span>}>
                                            <div className="py-4 text-center">
                                                <img src="https://razorpay.com/blog-content/build/browser/static/razorpay-logo.501934fb.svg" alt="Razorpay" style={{ height: '30px', marginBottom: '1.5rem', filter: 'grayscale(1)' }} />
                                                <h4>Instant Settlement</h4>
                                                <p className="text-muted mb-4">Pay using UPI, Cards, or Netbanking via Razorpay gateway.</p>
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    className="px-5 py-3"
                                                    onClick={handleOnlinePayment}
                                                    disabled={loading || fineAmount <= 0}
                                                >
                                                    {loading ? <Spinner size="sm" /> : 'Pay with Razorpay'}
                                                </Button>
                                            </div>
                                        </Tab>
                                        <Tab eventKey="manual_upi" title={<span><FiSmartphone className="me-2" />UPI Scan</span>}>
                                            <div className="py-4 text-center">
                                                {adminDetails && (
                                                    <Row className="align-items-center">
                                                        <Col sm={6}>
                                                            <div className="p-2 bg-white rounded-3 shadow-sm d-inline-block border">
                                                                <img src={qrCodeUrl} alt="UPI QR" style={{ width: '200px' }} />
                                                            </div>
                                                            <p className="small text-muted mt-2">Scan with PhonePe, GPay, or Paytm</p>
                                                        </Col>
                                                        <Col sm={6} className="text-start">
                                                            <div className="mb-3">
                                                                <label className="fw-bold small text-primary mb-1 d-block">UPI ID</label>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <code className="bg-light p-2 rounded flex-grow-1">{adminDetails.upiId}</code>
                                                                    <Button variant="outline-primary" size="sm" onClick={() => handleCopy(adminDetails.upiId, 'UPI ID')}><FiCopy /></Button>
                                                                </div>
                                                            </div>
                                                            <div className="mb-4">
                                                                <label className="fw-bold small text-primary mb-1 d-block">Payee Name</label>
                                                                <div className="bg-light p-2 rounded small">{adminDetails.upiName}</div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                )}
                                                <hr className="my-4" />
                                                <Form onSubmit={handleManualSubmit}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-bold small">Transaction ID / Reference Number</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter 12-digit UPI reference ID"
                                                            value={txnId}
                                                            onChange={(e) => setTxnId(e.target.value)}
                                                            required
                                                        />
                                                    </Form.Group>
                                                    <Button variant="primary" type="submit" className="w-100 py-2" disabled={submitting || fineAmount <= 0}>
                                                        {submitting ? <Spinner size="sm" /> : 'Submit Proof for Verification'}
                                                    </Button>
                                                </Form>
                                            </div>
                                        </Tab>
                                        <Tab eventKey="manual_bank" title={<span><FiHome className="me-2" />Bank Transfer</span>}>
                                            <div className="py-3">
                                                {adminDetails && (
                                                    <div className="bg-light p-4 rounded-4 mb-4">
                                                        <Row className="gy-3">
                                                            <Col xs={12}>
                                                                <small className="text-muted d-block">Account Holder</small>
                                                                <span className="fw-bold">{adminDetails.accountHolder}</span>
                                                            </Col>
                                                            <Col xs={12} sm={6}>
                                                                <small className="text-muted d-block">Account Number</small>
                                                                <span className="fw-bold font-monospace">{adminDetails.accountNo}</span>
                                                                <Button variant="link" size="sm" className="p-0 ms-2" onClick={() => handleCopy(adminDetails.accountNo, 'Account Number')}><FiCopy /></Button>
                                                            </Col>
                                                            <Col xs={12} sm={6}>
                                                                <small className="text-muted d-block">IFSC Code</small>
                                                                <span className="fw-bold font-monospace">{adminDetails.ifsc}</span>
                                                                <Button variant="link" size="sm" className="p-0 ms-2" onClick={() => handleCopy(adminDetails.ifsc, 'IFSC Code')}><FiCopy /></Button>
                                                            </Col>
                                                            <Col xs={12}>
                                                                <small className="text-muted d-block">Bank Name</small>
                                                                <span className="fw-bold">{adminDetails.bankName}</span>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )}
                                                <Form onSubmit={handleManualSubmit}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-bold small">UTR / Transaction ID</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter Bank transaction ID"
                                                            value={txnId}
                                                            onChange={(e) => setTxnId(e.target.value)}
                                                            required
                                                        />
                                                    </Form.Group>
                                                    <Button variant="primary" type="submit" className="w-100 py-2" disabled={submitting || fineAmount <= 0}>
                                                        {submitting ? <Spinner size="sm" /> : 'Submit Transfer for Verification'}
                                                    </Button>
                                                </Form>
                                            </div>
                                        </Tab>
                                    </Tabs>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Payment;
