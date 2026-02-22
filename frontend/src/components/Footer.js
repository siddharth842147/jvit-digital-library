import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <Container>
                <Row className="g-4">
                    <Col md={4}>
                        <h5 style={{ marginBottom: 'var(--spacing-lg)', fontWeight: 800 }}>JVIT Digital Library</h5>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Providing cutting-edge educational resources and a vast digital archive to the students and faculty of Jnana Vikas Institute of Technology.
                        </p>
                        <div className="d-flex gap-3 mt-3">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                                <FiGithub size={24} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                                <FiTwitter size={24} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                                <FiLinkedin size={24} />
                            </a>
                        </div>
                    </Col>

                    <Col md={4}>
                        <h5 style={{ marginBottom: 'var(--spacing-lg)' }}>Quick Links</h5>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <a href="/books" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                    Browse Books
                                </a>
                            </li>
                            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <a href="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                    Dashboard
                                </a>
                            </li>
                            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <a href="/my-books" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                    My Books
                                </a>
                            </li>
                            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <a href="/payment-history" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                    Payment History
                                </a>
                            </li>
                        </ul>
                    </Col>

                    <Col md={4}>
                        <h5 style={{ marginBottom: 'var(--spacing-lg)' }}>Contact Us</h5>
                        <div style={{ color: 'var(--text-secondary)' }}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <FiMapPin size={18} />
                                <span>123 Library Street, City, State 12345</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <FiPhone size={18} />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <FiMail size={18} />
                                <span>info@library.com</span>
                            </div>
                        </div>
                    </Col>
                </Row>

                <hr style={{ margin: 'var(--spacing-xl) 0', borderColor: 'var(--border-color)' }} />

                <Row>
                    <Col className="text-center">
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            © {currentYear} Jnana Vikas Institute of Technology. All rights reserved.
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
