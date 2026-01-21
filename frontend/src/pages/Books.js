import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, InputGroup, Card, Badge, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiSearch, FiBook } from 'react-icons/fi';
import { getBooks, getCategories } from '../services/bookService';
import { toast } from 'react-toastify';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

    return (
        <div style={{ padding: '3rem 0' }}>
            <Container>
                <div className="text-center mb-5">
                    <h1 style={{ fontWeight: 700 }}>Browse Our Collection</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Discover your next favorite book from our vast collection
                    </p>
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
                                                src={book.coverImage}
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
            </Container>
        </div>
    );
};

export default Books;
