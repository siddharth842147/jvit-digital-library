import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiBook, FiImage, FiCamera } from 'react-icons/fi';
import { getBooks, addBook, updateBook, deleteBook, getCategories } from '../../services/bookService';
import { toast } from 'react-toastify';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [uploadingBulk, setUploadingBulk] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    const handleDownloadReport = async (type) => {
        try {
            const config = {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob'
            };
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports/${type}`, config);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!bulkFile) return toast.warn('Please select a CSV file');

        try {
            setUploadingBulk(true);
            const data = new FormData();
            data.append('file', bulkFile);

            await axios.post(`${process.env.REACT_APP_API_URL}/books/bulk-upload`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            toast.success('Books uploaded successfully!');
            setShowBulkModal(false);
            fetchBooks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bulk upload failed');
        } finally {
            setUploadingBulk(false);
        }
    };

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        description: '',
        publisher: '',
        publishedYear: new Date().getFullYear(),
        pages: '',
        totalCopies: 1,
        coverImage: '',
        shelfLocation: ''
    });

    const fetchBooks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getBooks({ search: searchTerm, limit: 100 });
            setBooks(response.data);
        } catch (error) {
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchBooks();
        loadCategories();
    }, [fetchBooks]);

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBooks();
    };

    const handleOpenModal = (book = null) => {
        if (book) {
            setIsEditing(true);
            setCurrentBook(book);
            setFormData({
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                category: book.category,
                description: book.description,
                publisher: book.publisher,
                publishedYear: book.publishedYear,
                pages: book.pages,
                totalCopies: book.totalCopies,
                coverImage: book.coverImage,
                shelfLocation: book.shelfLocation || ''
            });
        } else {
            setIsEditing(false);
            setFormData({
                title: '',
                author: '',
                isbn: '',
                category: categories[0] || '',
                description: '',
                publisher: '',
                publishedYear: new Date().getFullYear(),
                pages: '',
                totalCopies: 1,
                coverImage: '',
                shelfLocation: ''
            });
        }
        setCoverFile(null);
        setShowModal(true);
    };

    // Barcode scanner state
    const [showScanner, setShowScanner] = useState(false);
    const [scanner, setScanner] = useState(null);

    const startScanner = async () => {
        setShowScanner(true);
        setTimeout(() => {
            try {
                const qrcode = new Html5Qrcode('reader');
                setScanner(qrcode);
                const config = {
                    fps: 15,
                    qrbox: { width: 300, height: 200 },
                    aspectRatio: 1.5,
                    videoConstraints: {
                        facingMode: 'environment',
                        focusMode: 'continuous',
                        whiteBalanceMode: 'continuous'
                    }
                };
                qrcode.start(
                    { facingMode: 'environment' },
                    config,
                    (decodedText) => {
                        handleBarcodeScanned(decodedText);
                    },
                    (errorMessage) => {
                        // ignore per-frame errors
                    }
                ).catch(err => {
                    console.error('Scanner start error', err);
                    toast.error('Unable to start camera for scanning');
                    setShowScanner(false);
                });
            } catch (err) {
                console.error(err);
                toast.error('Scanner initialization failed');
                setShowScanner(false);
            }
        }, 500);
    };

    const stopScanner = async () => {
        if (scanner) {
            try {
                await scanner.stop();
            } catch (e) {
                console.warn('Error stopping scanner', e);
            }
            try { scanner.clear(); } catch (e) { }
            setScanner(null);
        }
        setShowScanner(false);
    };

    const handleBarcodeScanned = async (raw) => {
        // Extract digits (ISBN/EAN)
        const digits = (raw || '').replace(/[^0-9Xx]/g, '').trim();
        if (!digits) return;
        // Many barcodes are EAN-13 with leading zeros; prefer 13 or 10
        let isbn = digits;
        if (isbn.length > 13) isbn = isbn.slice(-13);
        // stop scanner
        await stopScanner();
        setFormData(prev => ({ ...prev, isbn }));
        // fetch details from Open Library
        fetchBookByISBN(isbn);
    };

    const fetchBookByISBN = async (isbn) => {
        try {
            toast.info('Looking up ISBN ' + isbn + '...');
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const res = await axios.get(`${apiUrl}/isbn/lookup/${isbn}`);
            if (res.data && res.data.data) {
                const info = res.data.data;

                setFormData(prev => ({
                    ...prev,
                    title: info.title || prev.title,
                    author: info.author || prev.author,
                    publisher: info.publisher || prev.publisher,
                    publishedYear: info.publishedYear || prev.publishedYear,
                    pages: info.pages || prev.pages,
                    coverImage: info.coverImage || prev.coverImage,
                    description: info.description || prev.description
                }));
                toast.success('Book details auto-filled!');
                return;
            }
            toast.error('No book details found for this ISBN');
        } catch (err) {
            console.error('Lookup error', err);
            toast.error('Failed to lookup ISBN. Please enter details manually.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book? This will also affect borrow records.')) {
            try {
                await deleteBook(id);
                toast.success('Book deleted successfully');
                fetchBooks();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Delete failed');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (coverFile) {
                data.append('coverImage', coverFile);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            if (isEditing) {
                const apiUrl = process.env.REACT_APP_API_URL || '';
                await axios.put(`${apiUrl}/books/${currentBook._id}`, data, config);
                toast.success('Book updated successfully');
            } else {
                const apiUrl = process.env.REACT_APP_API_URL || '';
                await axios.post(`${apiUrl}/books`, data, config);
                toast.success('New book added successfully');
            }
            setShowModal(false);
            fetchBooks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div style={{ padding: '3rem 0', background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)' }}>
            <Container>
                <Row className="mb-5 align-items-center">
                    <Col md={6}>
                        <h1 style={{ fontWeight: 800 }}>Manage Library Stock 📚</h1>
                        <p className="text-muted">Maintain your physical and digital book catalog.</p>
                    </Col>
                    <Col md={6} className="text-md-end d-flex gap-2 justify-content-end align-items-center">
                        <Button variant="outline-success" onClick={() => handleDownloadReport('inventory')}>Inventory PDF</Button>
                        <Button variant="outline-success" onClick={() => handleDownloadReport('fines')}>Fines PDF</Button>
                        <Button variant="success" onClick={() => setShowBulkModal(true)}>Bulk Upload</Button>
                        <Button variant="primary" className="px-4 py-2 fw-bold d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
                            <FiPlus /> Add New Book
                        </Button>
                    </Col>
                </Row>

                {/* Filters */}
                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 'var(--radius-xl)' }}>
                    <Card.Body className="p-3">
                        <Form onSubmit={handleSearch}>
                            <Row className="g-3">
                                <Col md={8}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FiSearch className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search by title, author, or ISBN..."
                                            className="border-start-0"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <Button variant="primary" type="submit">Search</Button>
                                    </InputGroup>
                                </Col>
                                <Col md={4}>
                                    <Form.Select>
                                        <option>All Categories</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Inventory Table */}
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
                                            <th className="px-4 py-3 border-0 small text-muted">BOOK INFO</th>
                                            <th className="py-3 border-0 small text-muted">ISBN</th>
                                            <th className="py-3 border-0 small text-muted">CATEGORY</th>
                                            <th className="py-3 border-0 small text-muted">STOCK</th>
                                            <th className="py-3 border-0 small text-muted text-end px-4">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map((book) => (
                                            <tr key={book._id}>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src={book.coverImage?.startsWith('http') ? book.coverImage : `${process.env.REACT_APP_API_URL.replace('/api', '')}${book.coverImage}`}
                                                            alt=""
                                                            style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                        <div>
                                                            <div className="fw-bold">{book.title}</div>
                                                            <small className="text-muted">by {book.author}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="font-monospace small">{book.isbn}</td>
                                                <td><Badge bg="light" text="primary">{book.category}</Badge></td>
                                                <td>
                                                    <div className="fw-bold">{book.availableCopies} / {book.totalCopies}</div>
                                                    <div className="progress mt-1" style={{ height: '4px', width: '60px' }}>
                                                        <div
                                                            className="progress-bar bg-success"
                                                            style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="text-end px-4">
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(book)}>
                                                            <FiEdit2 />
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(book._id)}>
                                                            <FiTrash2 />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                        {!loading && books.length === 0 && (
                            <div className="text-center py-5">
                                <FiBook size={48} className="text-muted mb-3" />
                                <h5>No books found</h5>
                                <p className="text-muted">Try a different search term or add a new book.</p>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Add/Edit Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold">{isEditing ? 'Edit Book Record' : 'Add New Library Book'}</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body className="px-4 pb-4">
                            <Row className="g-3">
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">TITLE</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><FiBook /></InputGroup.Text>
                                            <Form.Control
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="Enter book title"
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">CATEGORY</Form.Label>
                                        <Form.Select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">AUTHOR</Form.Label>
                                        <Form.Control
                                            required
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            placeholder="Author name"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">ISBN</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                value={formData.isbn}
                                                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                                placeholder="ISBN-13 number (optional)"
                                            />
                                            <Button variant="outline-secondary" onClick={startScanner} title="Scan barcode">
                                                <FiCamera />
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">BOOK COVER IMAGE</Form.Label>
                                        <div className="d-flex flex-column gap-2">
                                            <InputGroup>
                                                <InputGroup.Text><FiImage /></InputGroup.Text>
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setCoverFile(e.target.files[0])}
                                                />
                                            </InputGroup>
                                            <div className="text-center small text-muted text-uppercase fw-bold">OR PROVIDE URL</div>
                                            <InputGroup>
                                                <InputGroup.Text><FiImage /></InputGroup.Text>
                                                <Form.Control
                                                    value={formData.coverImage}
                                                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                                    placeholder="Link to book image (https://...)"
                                                />
                                            </InputGroup>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">TOTAL COPIES</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            value={formData.totalCopies}
                                            onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value, availableCopies: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">PUBLISHER</Form.Label>
                                        <Form.Control
                                            value={formData.publisher}
                                            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                            placeholder="e.g. O'Reilly"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">SHELF LOCATION</Form.Label>
                                        <Form.Control
                                            value={formData.shelfLocation}
                                            onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                                            placeholder="e.g. B-402"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">DESCRIPTION</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Brief summary based on back cover..."
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer className="border-0 px-4 pb-4">
                            <Button variant="light" className="px-4" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit" className="px-5 fw-bold">
                                {isEditing ? 'Save Changes' : 'Add to Collection'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
                {/* Scanner Modal */}
                <Modal show={showScanner} onHide={stopScanner} centered size="md">
                    <Modal.Header closeButton>
                        <Modal.Title>Scan Book Barcode</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div id="reader" style={{ width: '100%' }} />
                        <div className="text-center mt-3">
                            <small className="text-muted">Hold the book barcode steady in front of the camera.</small>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={stopScanner}>Close</Button>
                    </Modal.Footer>
                </Modal>
                {/* Bulk Upload Modal */}
                <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold">Bulk Book Upload</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <p className="text-muted small mb-4">
                            Upload a CSV file with headers: <strong>title, author, isbn, category, publisher, publishedYear, pages, totalCopies</strong>
                        </p>
                        <Form onSubmit={handleBulkUpload}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">SELECT CSV FILE</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept=".csv"
                                    required
                                    onChange={(e) => setBulkFile(e.target.files[0])}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button variant="primary" type="submit" className="w-100 py-2 fw-bold" disabled={uploadingBulk}>
                                    {uploadingBulk ? <Spinner size="sm" /> : 'Start Upload'}
                                </Button>
                                <Button variant="light" className="w-100 py-2 fw-bold" onClick={() => setShowBulkModal(false)}>Cancel</Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default ManageBooks;
