import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Card, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { FiCheck, FiX, FiEye, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { getPaymentHistory, verifyManualPayment } from '../../services/paymentService';
import { toast } from 'react-toastify';

const VerifyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await getPaymentHistory({ status: 'verifying' });
            if (response.success) {
                setPayments(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch pending payments');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (status) => {
        try {
            setActionLoading(true);
            const response = await verifyManualPayment(selectedPayment._id, {
                status,
                adminNotes
            });

            if (response.success) {
                toast.success(`Payment ${status === 'completed' ? 'approved' : 'rejected'}! ${status === 'completed' ? 'Confirmation email sent.' : ''}`);
                setShowModal(false);
                fetchPayments();
            }
        } catch (error) {
            toast.error('Verification failed');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredPayments = payments.filter(p =>
        p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem 0', background: 'var(--bg-secondary)', minHeight: '80vh' }}>
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 style={{ fontWeight: 800 }}>Payment Verification</h2>
                        <p className="text-muted">Review and confirm manual UPI/Bank payments submitted by students.</p>
                    </div>
                    <Button variant="outline-primary" onClick={fetchPayments} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spin' : ''} /> Refresh
                    </Button>
                </div>

                <Card className="border-0 shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <Card.Body className="p-4">
                        <div className="mb-4 position-relative" style={{ maxWidth: '400px' }}>
                            <Form.Control
                                type="text"
                                placeholder="Search by Student or TXN ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="ps-5"
                                style={{ borderRadius: 'var(--radius-md)' }}
                            />
                            <FiSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        </div>

                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Student</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                        <th>Method</th>
                                        <th>Transaction ID</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                                    ) : filteredPayments.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-5 text-muted">No pending payments found.</td></tr>
                                    ) : (
                                        filteredPayments.map(payment => (
                                            <tr key={payment._id}>
                                                <td>
                                                    <div className="fw-bold">{payment.user?.name}</div>
                                                    <div className="small text-muted">{payment.user?.email}</div>
                                                </td>
                                                <td><Badge bg="light" className="text-dark">₹{payment.amount}</Badge></td>
                                                <td><Badge bg="info" className="text-capitalize">{payment.paymentType}</Badge></td>
                                                <td><Badge bg="secondary" className="text-capitalize">{payment.paymentMethod}</Badge></td>
                                                <td><code className="text-primary">{payment.transactionId}</code></td>
                                                <td><small>{new Date(payment.createdAt).toLocaleDateString()}</small></td>
                                                <td>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => { setSelectedPayment(payment); setShowModal(true); }}
                                                        className="d-flex align-items-center gap-2"
                                                    >
                                                        <FiEye /> Review
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Verification Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Payment Review</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedPayment && (
                        <Row className="gy-4">
                            <Col md={6}>
                                <label className="text-muted small fw-bold text-uppercase">Student Details</label>
                                <div className="p-3 bg-light rounded-3">
                                    <div className="fw-bold fs-5">{selectedPayment.user?.name}</div>
                                    <div>{selectedPayment.user?.email}</div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <label className="text-muted small fw-bold text-uppercase">Payment Details</label>
                                <div className="p-3 bg-light rounded-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Amount:</span> <span className="fw-bold text-primary">₹{selectedPayment.amount}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Type:</span> <span className="text-capitalize">{selectedPayment.paymentType}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Method:</span> <span className="text-capitalize">{selectedPayment.paymentMethod}</span>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <label className="text-muted small fw-bold text-uppercase">Student's Transaction Reference</label>
                                <div className="p-3 bg-dark text-white rounded-3 font-monospace fs-4 text-center">
                                    {selectedPayment.transactionId}
                                </div>
                            </Col>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Admin Notes (Optional, will be sent in email)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Note for student..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        style={{ borderRadius: 'var(--radius-md)' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 p-4 pt-0 justify-content-between">
                    <Button variant="outline-danger" className="px-4" onClick={() => handleAction('failed')} disabled={actionLoading}>
                        <FiX className="me-2" /> Reject
                    </Button>
                    <Button variant="success" className="px-5 py-2 shadow-sm" onClick={() => handleAction('completed')} disabled={actionLoading}>
                        {actionLoading ? <Spinner size="sm" /> : <><FiCheck className="me-2" /> Verify & Confirm</>}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VerifyPayments;
