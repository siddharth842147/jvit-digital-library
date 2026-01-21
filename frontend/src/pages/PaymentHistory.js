import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { FiDollarSign, FiDownload, FiExternalLink, FiSearch, FiFileText, FiMail, FiSend } from 'react-icons/fi';
import { getPaymentHistory, sendReceiptEmail, downloadReceipt } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PaymentHistory = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState(null);

    const isStaff = user?.role === 'admin' || user?.role === 'librarian';

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await getPaymentHistory();
                setPayments(response.data);
            } catch (error) {
                toast.error('Error fetching payment history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleSendReceipt = async (paymentId) => {
        try {
            setSendingEmail(paymentId);
            const response = await sendReceiptEmail(paymentId);
            toast.success(response.message || 'Receipt sent to member email!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send email');
        } finally {
            setSendingEmail(null);
        }
    };

    const handleDownload = async (paymentId) => {
        try {
            const response = await downloadReceipt(paymentId);
            window.open(process.env.REACT_APP_API_URL.replace('/api', '') + response.data.receiptUrl, '_blank');
        } catch (error) {
            toast.error('Failed to download receipt');
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div style={{ padding: '3rem 0', background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)' }}>
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 style={{ fontWeight: 800 }}>{isStaff ? 'Payment Management' : 'Payment History'}</h1>
                        <p className="text-muted">
                            {isStaff ? 'Review and manage library transactions across all members.' : 'Keep track of all your library transactions and receipts.'}
                        </p>
                    </div>
                </div>

                <Card className="border-0 shadow-sm" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                    <Card.Body className="p-0">
                        {payments.length > 0 ? (
                            <div className="table-responsive">
                                <Table hover className="align-middle border-0 mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-4 py-3 border-0">Transaction</th>
                                            {isStaff && <th className="py-3 border-0">Member</th>}
                                            <th className="py-3 border-0">Description</th>
                                            <th className="py-3 border-0">Amount</th>
                                            <th className="py-3 border-0">Date</th>
                                            <th className="py-3 border-0">Status</th>
                                            <th className="py-3 border-0 text-end px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment._id}>
                                                <td className="px-4 py-3">
                                                    <div className="fw-bold text-primary small">
                                                        #{payment.transactionId?.substring(0, 12) || payment._id.substring(0, 8).toUpperCase()}
                                                    </div>
                                                </td>
                                                {isStaff && (
                                                    <td>
                                                        <div className="small fw-bold">{payment.user?.name}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{payment.user?.email}</div>
                                                    </td>
                                                )}
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FiFileText className="text-muted" />
                                                        <span className="text-capitalize">{payment.paymentType}</span>
                                                    </div>
                                                </td>
                                                <td className="fw-bold text-success">₹{payment.amount}</td>
                                                <td className="text-muted small">
                                                    {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <Badge bg={payment.status === 'completed' || payment.status === 'success' ? 'success' : 'warning'} pill>
                                                        {payment.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-end px-4">
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleDownload(payment._id)}
                                                            disabled={payment.status !== 'completed' && payment.status !== 'success'}
                                                        >
                                                            <FiDownload />
                                                        </Button>

                                                        {isStaff && (
                                                            <Button
                                                                variant="outline-info"
                                                                size="sm"
                                                                onClick={() => handleSendReceipt(payment._id)}
                                                                disabled={sendingEmail === payment._id || (payment.status !== 'completed' && payment.status !== 'success')}
                                                            >
                                                                {sendingEmail === payment._id ? <Spinner size="sm" /> : <FiMail title="Send to Member" />}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="mb-4" style={{ color: 'var(--gray-light)' }}>
                                    <FiDollarSign size={80} />
                                </div>
                                <h3 className="fw-bold">No payments found</h3>
                                <p className="text-muted">No transactions have been recorded in the system.</p>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                <div className="mt-5 p-4 rounded-4" style={{ background: 'var(--gradient-dark)', color: 'white' }}>
                    <Row className="align-items-center">
                        <Col md={8}>
                            <h5 className="fw-bold mb-2">Need a Physical Receipt?</h5>
                            <p className="mb-0 opacity-75">You can download individual receipts for each transaction or request a consolidated statement from the librarian.</p>
                        </Col>
                        <Col md={4} className="text-md-end mt-4 mt-md-0">
                            <Button variant="light" className="px-4">Contact Librarian</Button>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default PaymentHistory;
