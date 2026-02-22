import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Policy = () => {
    return (
        <Container className="py-5">
            <h1 className="text-center mb-5 fw-bold">Library Policy ⚖️</h1>

            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body className="p-4">
                            <h3 className="fw-bold mb-4 text-primary">1. Borrowing Rules</h3>
                            <ul className="list-unstyled">
                                <li className="mb-3">
                                    <strong>Max Books:</strong> A student can borrow up to <strong>3 books</strong> at a time.
                                </li>
                                <li className="mb-3">
                                    <strong>Duration:</strong> The standard borrow period is <strong>14 days</strong>.
                                </li>
                                <li className="mb-3">
                                    <strong>Renewal:</strong> Books can be renewed if there are no pending requests for the same book.
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body className="p-4">
                            <h3 className="fw-bold mb-4 text-danger">2. Fine System</h3>
                            <p className="mb-3">Our fine system is designed to be intelligent and fair, excluding non-operational days.</p>
                            <ul className="list-unstyled">
                                <li className="mb-3">
                                    <strong>Fine Rate:</strong> ₹10 per day for overdue returns.
                                </li>
                                <li className="mb-3">
                                    <strong>Exemptions:</strong> No fines are charged on:
                                    <ul className="mt-2 text-muted">
                                        <li>All Sundays</li>
                                        <li>1st and 3rd Saturdays of the month</li>
                                        <li>Government Holidays (as defined by JVIT administration)</li>
                                    </ul>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body className="p-4">
                            <h3 className="fw-bold mb-4 text-warning">3. General Conduct</h3>
                            <ul className="list-unstyled text-muted">
                                <li className="mb-2">Maintain silence in the library premises.</li>
                                <li className="mb-2">Handle books with care. Any damage or loss must be reported immediately.</li>
                                <li className="mb-2">Digital IDs must be presented for book issuance.</li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <div className="text-center mt-5 text-muted small">
                        Last Updated: February 2026 | JVIT Library Administration
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Policy;
