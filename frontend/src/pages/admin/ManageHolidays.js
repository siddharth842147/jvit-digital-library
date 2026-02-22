import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Spinner } from 'react-bootstrap';
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        description: '',
        type: 'government'
    });

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/holidays`);
            setHolidays(response.data.data);
        } catch (error) {
            toast.error('Failed to load holidays');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/holidays`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Holiday added successfully');
            setShowModal(false);
            setFormData({ date: '', description: '', type: 'government' });
            fetchHolidays();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add holiday');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this holiday? This will affect future fine calculations.')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/holidays/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success('Holiday removed');
                fetchHolidays();
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    return (
        <div style={{ padding: '3rem 0', background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)' }}>
            <Container>
                <Row className="mb-5 align-items-center">
                    <Col md={6}>
                        <h1 style={{ fontWeight: 800 }}>Holiday Calendar 🗓️</h1>
                        <p className="text-muted">Manage closed days for intelligent fine calculation.</p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <Button variant="primary" className="px-4 py-2 fw-bold d-flex align-items-center gap-2 ms-auto" onClick={() => setShowModal(true)}>
                            <FiPlus /> Add Holiday
                        </Button>
                    </Col>
                </Row>

                <Alert variant="info" className="border-0 shadow-sm mb-4" style={{ borderRadius: 'var(--radius-xl)' }}>
                    <div className="d-flex gap-3">
                        <FiInfo size={24} className="mt-1" />
                        <div>
                            <h6 className="fw-bold mb-1">How Fine Calculation Works:</h6>
                            <p className="mb-0 small opacity-75">
                                Fines are automatically **skipped** for all Sundays and 1st/3rd Saturdays.
                                Add additional government holidays here to ensure students are not penalized for closed days.
                            </p>
                        </div>
                    </div>
                </Alert>

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
                                            <th className="px-4 py-3 border-0 small text-muted">DATE</th>
                                            <th className="py-3 border-0 small text-muted">DESCRIPTION</th>
                                            <th className="py-3 border-0 small text-muted">TYPE</th>
                                            <th className="py-3 border-0 small text-muted text-end px-4">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {holidays.map((h) => (
                                            <tr key={h._id}>
                                                <td className="px-4 py-3 fw-bold">
                                                    {new Date(h.date).toLocaleDateString('en-IN', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td>{h.description}</td>
                                                <td>
                                                    <span className={`badge ${h.type === 'government' ? 'bg-danger' : 'bg-warning'} opacity-75`}>
                                                        {h.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="text-end px-4">
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(h._id)}>
                                                        <FiTrash2 />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {holidays.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5 text-muted">
                                                    No custom holidays added yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold">Add Holiday</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body className="px-4">
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">HOLIDAY DATE</Form.Label>
                                <Form.Control
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">DESCRIPTION</Form.Label>
                                <Form.Control
                                    placeholder="e.g. Independence Day"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">TYPE</Form.Label>
                                <Form.Select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="government">Government Holiday</option>
                                    <option value="festival">Festival</option>
                                    <option value="other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer className="border-0 px-4 pb-4">
                            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit" className="px-5 fw-bold">Add to Calendar</Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Container>
        </div>
    );
};

// Internal Alert Component for convenience within this file
const Alert = ({ variant, children, className, style }) => (
    <div className={`alert alert-${variant} ${className}`} style={style}>
        {children}
    </div>
);

export default ManageHolidays;
