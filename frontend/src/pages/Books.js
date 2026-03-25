import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, InputGroup, Card, Badge, Pagination, Modal, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiSearch, FiBook, FiPlus, FiCamera, FiImage } from 'react-icons/fi';
import { getBooks, getCategories } from '../services/bookService';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';

const Books = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scanner, setScanner] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '', author: '', isbn: '', category: '', description: '', publisher: '',
        publishedYear: new Date().getFullYear(), pages: '', totalCopies: 1, coverImage: '', shelfLocation: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBooks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getBooks({
                search,
                category: category !== 'all' ? category : undefined,
                page: currentPage,
                limit: 12
            });
            setBooks(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            toast.error('Error fetching books');
        } finally {
            setLoading(false);
        }
    }, [search, category, currentPage]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const handleOpenModal = () => {
        setFormData({
            title: '', author: '', isbn: '', category: categories[0] || '', description: '',
            publisher: '', publishedYear: new Date().getFullYear(), pages: '', totalCopies: 1, coverImage: '', shelfLocation: ''
        });
        setCoverFile(null);
        setShowModal(true);
    };

    const startScanner = async () => {
        setShowScanner(true);
        setTimeout(() => {
            try {
                const qrcode = new Html5Qrcode('reader');
                setScanner(qrcode);
                qrcode.start(
                    { facingMode: 'environment' },
                    { fps: 15, qrbox: { width: 300, height: 200 }, aspectRatio: 1.5 },
                    (decodedText) => handleBarcodeScanned(decodedText),
                    () => {}
                ).catch(err => { toast.error('Unable to start camera'); setShowScanner(false); });
            } catch (err) { toast.error('Scanner init failed'); setShowScanner(false); }
        }, 500);
    };

    const stopScanner = async () => {
        if (scanner) {
            try { await scanner.stop(); } catch (e) {}
            try { scanner.clear(); } catch (e) {}
            setScanner(null);
        }
        setShowScanner(false);
    };

    const handleBarcodeScanned = async (raw) => {
        const digits = (raw || '').replace(/[^0-9Xx]/g, '').trim();
        if (!digits) return;
        let isbn = digits.length > 13 ? digits.slice(-13) : digits;
        await stopScanner();
        setFormData(prev => ({ ...prev, isbn }));
        fetchBookByISBN(isbn);
    };

    const fetchBookByISBN = async (isbn) => {
        try {
            toast.info('Looking up ISBN...');
            const res = await axios.get(`${process.env.REACT_APP_API_URL || ''}/isbn/lookup/${isbn}`);
            if (res.data && res.data.data) {
                const info = res.data.data;
                setFormData(prev => ({ ...prev, title: info.title || prev.title, author: info.author || prev.author, description: info.description || prev.description, coverImage: info.coverImage || prev.coverImage, publisher: info.publisher || prev.publisher, publishedYear: info.publishedYear || prev.publishedYear, pages: info.pages || prev.pages }));
                toast.success('Book details filled!');
            } else {
                toast.error('No book details found');
            }
        } catch (err) { toast.error('Lookup failed. Enter manually.'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(k => data.append(k, formData[k]));
            if (coverFile) data.append('coverImage', coverFile);
            await axios.post(`${process.env.REACT_APP_API_URL || ''}/books`, data, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Book added successfully');
            setShowModal(false);
            fetchBooks();
        } catch (error) { toast.error(error.response?.data?.message || 'Add failed'); }
    };

    return (
        <div style={{ padding: '3rem 0' }}>
            <Container>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5">
                    <div className="text-center text-md-start mb-3 mb-md-0">
                        <h1 style={{ fontWeight: 700 }}>Browse Our Collection</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: 0 }}>
                            Discover your next favorite book from our vast collection
                        </p>
                    </div>
                    {user && (user.role === 'admin' || user.role === 'librarian') && (
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" className="fw-bold d-flex align-items-center gap-2 bg-white" onClick={() => { handleOpenModal(); setTimeout(startScanner, 200); }}>
                                <FiCamera /> Scan Barcode
                            </Button>
                            <Button variant="primary" className="fw-bold d-flex align-items-center gap-2 shadow-sm" onClick={handleOpenModal}>
                                <FiPlus /> Add Book
                            </Button>
                        </div>
                    )}
                </div>

                {/* Search and Filter */}
                <Row className="mb-4">
                    <Col md={8}>
                        <InputGroup>
                            <InputGroup.Text>
                                <FiSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search by title, author, or ISBN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="form-control"
                            />
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <Form.Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="form-control"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>

                {/* Books Grid */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner"></div>
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-5">
                        <FiBook size={60} style={{ color: 'var(--gray)' }} />
                        <h4 className="mt-3">No books found</h4>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <>
                        <Row className="g-4">
                            {books.map((book) => (
                                <Col key={book._id} sm={6} md={4} lg={3}>
                                    <Card className="book-card h-100">
                                        <div style={{ position: 'relative' }}>
                                            <Card.Img
                                                variant="top"
                                                src={book.coverImage?.startsWith('http') ? book.coverImage : `${process.env.REACT_APP_API_URL.replace('/api', '')}${book.coverImage}`}
                                                alt={book.title}
                                                style={{ height: '300px', objectFit: 'cover' }}
                                            />
                                            <Badge
                                                bg={book.status === 'available' ? 'success' : 'danger'}
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px'
                                                }}
                                            >
                                                {book.status}
                                            </Badge>
                                        </div>
                                        <Card.Body>
                                            <Badge bg="primary" className="mb-2">{book.category}</Badge>
                                            <Card.Title style={{ fontSize: '1rem', fontWeight: 600 }}>
                                                {book.title}
                                            </Card.Title>
                                            <Card.Text style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                by {book.author}
                                            </Card.Text>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <small style={{ color: 'var(--text-secondary)' }}>
                                                    {book.availableCopies}/{book.totalCopies} available
                                                </small>
                                                <Link to={`/books/${book._id}`} className="btn btn-primary btn-sm">
                                                    View Details
                                                </Link>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-5">
                                <Pagination>
                                    <Pagination.Prev
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    />
                                    {[...Array(totalPages)].map((_, index) => (
                                        <Pagination.Item
                                            key={index + 1}
                                            active={currentPage === index + 1}
                                            onClick={() => setCurrentPage(index + 1)}
                                        >
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    />
                                </Pagination>
                            </div>
                        )}
                    </>
                )}

                {/* Add Book Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold">Add New Book (Scanner & Manual)</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body className="px-4 pb-4">
                            <Row className="g-3">
                                <Col md={8}>
                                    <Form.Label className="small fw-bold">TITLE</Form.Label>
                                    <Form.Control required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="small fw-bold">CATEGORY</Form.Label>
                                    <Form.Select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </Form.Select>
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold">AUTHOR</Form.Label>
                                    <Form.Control required value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold">ISBN</Form.Label>
                                    <InputGroup>
                                        <Form.Control value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} placeholder="Scan or enter ISBN..." />
                                        <Button variant="outline-secondary" onClick={startScanner} title="Open Camera Scanner">
                                            <FiCamera />
                                        </Button>
                                    </InputGroup>
                                </Col>
                                <Col md={12}>
                                    <Form.Label className="small fw-bold">BOOK COVER (IMAGE FILE OR URL)</Form.Label>
                                    <div className="d-flex flex-column gap-2 mb-2">
                                        <Form.Control type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
                                        <Form.Control value={formData.coverImage} onChange={e => setFormData({ ...formData, coverImage: e.target.value })} placeholder="Or paste image URL here..." />
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="small fw-bold">TOTAL COPIES</Form.Label>
                                    <Form.Control type="number" min="1" value={formData.totalCopies} onChange={e => setFormData({ ...formData, totalCopies: e.target.value })} />
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="small fw-bold">PUBLISHER</Form.Label>
                                    <Form.Control value={formData.publisher} onChange={e => setFormData({ ...formData, publisher: e.target.value })} />
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="small fw-bold">SHELF LOCATION</Form.Label>
                                    <Form.Control value={formData.shelfLocation} onChange={e => setFormData({ ...formData, shelfLocation: e.target.value })} />
                                </Col>
                                <Col md={12}>
                                    <Form.Label className="small fw-bold">DESCRIPTION</Form.Label>
                                    <Form.Control as="textarea" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit" className="fw-bold">Add Book</Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                <Modal show={showScanner} onHide={stopScanner} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Scan Book Barcode</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div id="reader" style={{ width: '100%' }} />
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default Books;
