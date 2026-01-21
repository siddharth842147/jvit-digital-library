import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Spinner, InputGroup, Form } from 'react-bootstrap';
import { FiClock, FiCheckCircle, FiAlertCircle, FiSearch, FiFileText, FiUserCheck, FiRotateCcw, FiXCircle } from 'react-icons/fi';
import { getBorrowHistory, approveBorrow, verifyReturn } from '../../services/borrowService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Tabs, Tab } from 'react-bootstrap';

const BorrowManagement = () => {
    const { user: loggedInUser } = useAuth();
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('requests');

    const fetchBorrows = async () => {
        try {
            setLoading(true);
            // Get all records for history to filter by status on frontend for simplicity in this view
            const response = await getBorrowHistory({ limit: 100 });
            setBorrows(response.data);
        } catch (error) {
            toast.error('Failed to load borrow records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrows();
    }, []);

    const handleApprove = async (id) => {
        try {
            const response = await approveBorrow(id);
            toast.success(response.message);
            fetchBorrows();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Approval failed');
        }
    };

    const handleVerifyReturn = async (id) => {
        try {
            const response = await verifyReturn(id);
            toast.success(response.message);
            fetchBorrows();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        }
    };

    const getFilteredBorrows = () => {
        let filtered = borrows;
        if (activeTab === 'requests') {
            filtered = borrows.filter(b => b.status === 'pending');
        } else if (activeTab === 'active') {
            filtered = borrows.filter(b => b.status === 'borrowed' || b.status === 'overdue');
        } else if (activeTab === 'returns') {
            filtered = borrows.filter(b => b.status === 'return_pending');
        } else {
            filtered = borrows.filter(b => b.status === 'returned' || b.status === 'rejected');
        }

        return filtered.filter(b =>
            b.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.book?.isbn?.includes(searchTerm)
        );
    };

    const filteredBorrows = getFilteredBorrows();

    return (
        <div style={{ padding: '3rem 0', background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)' }}>
            <Container>
                <div className="mb-5">
                    <h1 style={{ fontWeight: 800 }}>Borrowing Operations 📋</h1>
                    <p className="text-muted">Multi-step approval and physical return verification hub.</p>
                </div>

                <div className="mb-4">
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="border-0 custom-tabs mb-4"
                        fill
                    >
                        <Tab eventKey="requests" title={`Approval Requests (${borrows.filter(b => b.status === 'pending').length})`} />
                        <Tab eventKey="active" title={`Active Loans (${borrows.filter(b => b.status === 'borrowed' || b.status === 'overdue').length})`} />
                        <Tab eventKey="returns" title={`Return Verification (${borrows.filter(b => b.status === 'return_pending').length})`} />
                        <Tab eventKey="history" title="Finalized History" />
                    </Tabs>
                </div>

                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 'var(--radius-xl)' }}>
                    <Card.Body className="p-3">
                        <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">
                                <FiSearch className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name, book, or ISBN..."
                                className="border-start-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0 border-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-4 py-3 border-0 small text-muted">MEMBER</th>
                                            <th className="py-3 border-0 small text-muted">BOOK</th>
                                            <th className="py-3 border-0 small text-muted">STATUS / DETAILS</th>
                                            <th className="py-3 border-0 small text-muted text-end px-4">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBorrows.map((b) => {
                                            const isOverdue = b.status === 'overdue' || (b.status === 'borrowed' && new Date(b.dueDate) < new Date());

                                            return (
                                                <tr key={b._id}>
                                                    <td className="px-4 py-3">
                                                        <div className="fw-bold">{b.user?.name}</div>
                                                        <small className="text-muted small">{b.user?.email}</small>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold">{b.book?.title}</div>
                                                        <small className="text-muted">Due: {new Date(b.dueDate).toLocaleDateString()}</small>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column gap-1">
                                                            <Badge bg={
                                                                b.status === 'pending' ? 'warning' :
                                                                    b.status === 'overdue' ? 'danger' :
                                                                        b.status === 'return_pending' ? 'info' :
                                                                            b.status === 'returned' ? 'success' : 'primary'
                                                            } pill className="w-fit">
                                                                {b.status.toUpperCase().replace('_', ' ')}
                                                            </Badge>

                                                            {b.status === 'pending' && (
                                                                <div className="d-flex gap-1 mt-1">
                                                                    <Badge bg={b.approvedByLibrarian ? 'success' : 'secondary'} size="sm">
                                                                        {b.approvedByLibrarian ? 'Librarian OK' : 'Wait Librarian'}
                                                                    </Badge>
                                                                    <Badge bg={b.approvedByAdmin ? 'success' : 'secondary'} size="sm">
                                                                        {b.approvedByAdmin ? 'Admin OK' : 'Wait Admin'}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="text-end px-4">
                                                        {activeTab === 'requests' && (
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="fw-bold shadow-sm"
                                                                onClick={() => handleApprove(b._id)}
                                                                disabled={(loggedInUser.role === 'admin' && b.approvedByAdmin) || (loggedInUser.role === 'librarian' && b.approvedByLibrarian)}
                                                            >
                                                                <FiUserCheck className="me-1" />
                                                                {(loggedInUser.role === 'admin' && b.approvedByAdmin) || (loggedInUser.role === 'librarian' && b.approvedByLibrarian) ? 'Approved' : 'Approve'}
                                                            </Button>
                                                        )}

                                                        {activeTab === 'returns' && (
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                className="fw-bold shadow-sm"
                                                                onClick={() => handleVerifyReturn(b._id)}
                                                            >
                                                                <FiRotateCcw className="me-1" /> Finalize Return
                                                            </Button>
                                                        )}

                                                        {activeTab === 'active' && (
                                                            <span className="text-muted small italic">Waiting for student return...</span>
                                                        )}

                                                        {activeTab === 'history' && (
                                                            <span className="text-muted small">Completed: {new Date(b.updatedAt).toLocaleDateString()}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                        {!loading && filteredBorrows.length === 0 && (
                            <div className="text-center py-5">
                                <FiFileText size={48} className="text-muted mb-3" />
                                <h5>No records found for this section</h5>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default BorrowManagement;
