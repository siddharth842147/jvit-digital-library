import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { FiArrowLeft, FiBook, FiCalendar, FiHash, FiMapPin, FiLayers, FiCheckCircle, FiClock } from 'react-icons/fi';
import { getBook } from '../services/bookService';
import { borrowBook } from '../services/borrowService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowing, setBorrowing] = useState(false);
    const [showBorrowModal, setShowBorrowModal] = useState(false);

    // Set default return date to 14 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    const [returnDate, setReturnDate] = useState(defaultDate.toISOString().split('T')[0]);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                setLoading(true);
                const response = await getBook(id);
                setBook(response.data);
            } catch (error) {
                toast.error('Error fetching book details');
                navigate('/books');
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id, navigate]);

    const handleBorrowRequest = () => {
        if (!isAuthenticated) {
            toast.warn('Please login to borrow books');
            navigate('/login');
            return;
        }

        if (user.role !== 'student') {
            toast.info('Only students can borrow books online.');
            return;
        }

        setShowBorrowModal(true);
    };

    const handleConfirmBorrow = async () => {
        try {
            setBorrowing(true);
            const response = await borrowBook(book._id, returnDate);
            toast.success(response.message || 'Request submitted! Waiting for Admin & Librarian approval.');
            setShowBorrowModal(false);

            // Refresh book details to see updated availability
            const updatedBook = await getBook(id);
            setBook(updatedBook.data);

            navigate('/my-books');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to borrow book');
        } finally {
            setBorrowing(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!book) return null;

    return (
        <div style={{ padding: '4rem 0', background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)' }}>
            <Container>
                <Link to="/books" className="text-decoration-none d-flex align-items-center gap-2 mb-4 text-muted hover-primary transition-all">
                    <FiArrowLeft /> Back to collection
                </Link>

                <Card className="border-0 shadow-lg overflow-hidden" style={{ borderRadius: 'var(--radius-2xl)' }}>
                    <Row className="g-0">
                        <Col lg={4} className="position-relative">
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '500px' }}
                            />
                            <Badge
                                bg={book.status === 'Available' ? 'success' : 'danger'}
                                className="position-absolute top-0 end-0 m-4 px-3 py-2"
                                style={{ fontSize: '1rem', borderRadius: 'var(--radius-pill)' }}
                            >
                                {book.status}
                            </Badge>
                        </Col>

                        <Col lg={8}>
                            <Card.Body className="p-5">
                                <Badge bg="primary" className="mb-3 px-3 py-2 fw-medium">{book.category}</Badge>
                                <h1 className="display-5 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>{book.title}</h1>
                                <p className="h4 text-muted mb-4 fw-normal">by {book.author}</p>

                                <div className="mb-5">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                        <FiBook className="text-primary" /> Description
                                    </h5>
                                    <p className="text-secondary leading-relaxed" style={{ fontSize: '1.1rem' }}>
                                        {book.description || 'No description available for this book.'}
                                    </p>
                                </div>

                                <Row className="g-4 mb-5">
                                    <Col md={6}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="p-3 bg-light rounded-circle text-primary"><FiHash /></div>
                                            <div>
                                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>ISBN</small>
                                                <span className="fw-bold">{book.isbn}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="p-3 bg-light rounded-circle text-primary"><FiLayers /></div>
                                            <div>
                                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Published By</small>
                                                <span className="fw-bold">{book.publisher}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="p-3 bg-light rounded-circle text-primary"><FiCalendar /></div>
                                            <div>
                                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Year</small>
                                                <span className="fw-bold">{book.publishedYear}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="p-3 bg-light rounded-circle text-primary"><FiBook /></div>
                                            <div>
                                                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Pages</small>
                                                <span className="fw-bold">{book.pages}</span>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="p-4 bg-light rounded-4 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="fw-bold mb-1">
                                            {book.availableCopies} / {book.totalCopies} copies available
                                        </h5>
                                        <p className="text-muted small mb-0 d-flex align-items-center gap-1">
                                            <FiMapPin /> Located at Shelf: {book.shelfLocation || 'Main Hall'}
                                        </p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="px-5 py-3 fw-bold shadow-sm d-flex align-items-center gap-2"
                                        style={{ borderRadius: 'var(--radius-lg)' }}
                                        onClick={handleBorrowRequest}
                                        disabled={book.availableCopies === 0}
                                    >
                                        {book.availableCopies > 0 ? (
                                            <>Request Borrow</>
                                        ) : (
                                            <>Out of Stock</>
                                        )}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Col>
                    </Row>
                </Card>

                {/* Borrow Modal */}
                <Modal show={showBorrowModal} onHide={() => setShowBorrowModal(false)} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold">Confirm Borrowing</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-4 pb-4">
                        <div className="text-center mb-4">
                            <div className="d-inline-block p-4 bg-primary bg-opacity-10 rounded-circle text-primary mb-3">
                                <FiClock size={48} />
                            </div>
                            <h5>Set your Return Date</h5>
                            <p className="text-muted small">When do you plan to return <strong>"{book.title}"</strong>?</p>
                        </div>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold small text-muted">PLANED RETURN DATE</Form.Label>
                            <Form.Control
                                type="date"
                                value={returnDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setReturnDate(e.target.value)}
                                style={{ height: '50px', borderRadius: 'var(--radius-md)' }}
                            />
                            <Form.Text className="text-muted d-flex align-items-center gap-1 mt-2">
                                <FiCheckCircle className="text-success" /> Standard limit is 14 days. Fine ₹10/day applies if late.
                            </Form.Text>
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button
                                variant="primary"
                                className="w-100 py-2 fw-bold"
                                onClick={handleConfirmBorrow}
                                disabled={borrowing}
                            >
                                {borrowing ? <Spinner size="sm" /> : 'Confirm Borrow'}
                            </Button>
                            <Button
                                variant="light"
                                className="w-100 py-2 fw-bold"
                                onClick={() => setShowBorrowModal(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default BookDetails;
