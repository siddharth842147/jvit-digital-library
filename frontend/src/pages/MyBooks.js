import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { FiBook, FiCalendar, FiRotateCcw, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { getMyBorrowedBooks, returnBook } from '../services/borrowService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const MyBooks = () => {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returningId, setReturningId] = useState(null);

    const fetchMyBooks = async () => {
        try {
            setLoading(true);
            const response = await getMyBorrowedBooks();
            setBorrows(response.data);
        } catch (error) {
            toast.error('Error fetching your borrowed books');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBooks();
    }, []);

    const handleReturn = async (id) => {
        if (!window.confirm('Are you sure you want to return this book?')) return;

        try {
            setReturningId(id);
            const response = await returnBook(id);
            toast.success(response.message || 'Book returned successfully!');
            fetchMyBooks(); // Refresh list
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to return book';
            toast.error(message);
        } finally {
            setReturningId(null);
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
                        <h1 style={{ fontWeight: 800 }}>My Borrowed Books</h1>
                        <p className="text-muted">Track your reading and manage returns</p>
                    </div>
                    <Badge bg="primary" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)', fontSize: '1rem' }}>
                        {borrows.length} Active Borrows
                    </Badge>
                </div>

                {borrows.length === 0 ? (
                    <Card className="text-center py-5 border-0 shadow-sm" style={{ borderRadius: 'var(--radius-2xl)' }}>
                        <Card.Body>
                            <div className="mb-4" style={{ color: 'var(--gray-light)' }}>
                                <FiBook size={80} />
                            </div>
                            <h3>No borrowed books</h3>
                            <p className="text-muted mb-4">You don't have any books issued at the moment.</p>
                            <Link to="/books" className="btn btn-primary btn-lg">
                                Browse Collection
                            </Link>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row className="g-4">
                        {borrows.map((borrow) => (
                            <Col key={borrow._id} xl={6}>
                                <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                                    <Row className="g-0 h-100">
                                        <Col md={4}>
                                            <img
                                                src={borrow.book.coverImage}
                                                alt={borrow.book.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '250px' }}
                                            />
                                        </Col>
                                        <Col md={8}>
                                            <Card.Body className="d-flex flex-column p-4">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <Badge bg="info">{borrow.book.category}</Badge>
                                                        <div className="d-flex gap-2">
                                                            {borrow.status === 'overdue' && (
                                                                <Badge bg="danger" className="d-flex align-items-center gap-1">
                                                                    <FiAlertCircle /> OVERDUE
                                                                </Badge>
                                                            )}
                                                            {borrow.status === 'pending' && <Badge bg="warning">APPROVAL PENDING</Badge>}
                                                            {borrow.status === 'return_pending' && <Badge bg="secondary">RETURN PENDING VERIFICATION</Badge>}
                                                        </div>
                                                    </div>
                                                    <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{borrow.book.title}</h4>
                                                    <p className="text-muted mb-4">by {borrow.book.author}</p>

                                                    <div className="mb-4">
                                                        <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                                                            <FiCalendar /> <small>Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}</small>
                                                        </div>
                                                        <div className={`d-flex align-items-center gap-2 ${borrow.status === 'overdue' ? 'text-danger fw-bold' : 'text-primary'}`}>
                                                            <FiCalendar /> <small>Due Date: {new Date(borrow.dueDate).toLocaleDateString()}</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2 mt-auto">
                                                    <Button
                                                        variant={borrow.status === 'return_pending' ? 'outline-secondary' : 'primary'}
                                                        className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                                        onClick={() => handleReturn(borrow._id)}
                                                        disabled={returningId === borrow._id || borrow.status === 'pending' || borrow.status === 'return_pending'}
                                                    >
                                                        {returningId === borrow._id ? <Spinner size="sm" /> : <FiRotateCcw />}
                                                        {borrow.status === 'return_pending' ? 'Verifying Receipt...' : 'Return Book'}
                                                    </Button>
                                                    <Link to={`/books/${borrow.book._id}`} className="btn btn-outline-secondary">
                                                        <FiInfo />
                                                    </Link>
                                                </div>
                                            </Card.Body>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                <Card className="mt-5 border-0 bg-light p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <div className="d-flex gap-3 align-items-start text-muted">
                        <FiInfo size={24} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        <div>
                            <h6 className="mb-1 fw-bold">Library Rules</h6>
                            <ul className="mb-0 small">
                                <li>The standard borrowing period is 14 days.</li>
                                <li>A fine of ₹10 per day is applicable for late returns.</li>
                                <li>You can borrow up to 3 books at a time.</li>
                                <li>Please handle books with care.</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </Container>
        </div>
    );
};

export default MyBooks;
