import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Badge, Spinner, Modal } from 'react-bootstrap';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Question Paper',
        branch: '',
        semester: '1st',
        year: new Date().getFullYear(),
        description: '',
        file: null
    });

    const branches = ['CSE', 'ISE', 'ECE', 'ME', 'CE', 'AI & ML', 'Basic Science'];
    const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
    const types = ['Question Paper', 'Notes', 'Lab Manual', 'Other'];

    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/resources`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setResources(data.data);
        } catch (error) {
            toast.error('Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${process.env.REACT_APP_API_URL}/resources/${id}/status`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            toast.success(`Resource ${newStatus}`);
            fetchResources();
        } catch (error) {
            toast.error('Status update failed');
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'file') {
                    data.append('file', formData[key]);
                } else {
                    data.append(key, formData[key]);
                }
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            await axios.post(`${process.env.REACT_APP_API_URL}/resources`, data, config);
            toast.success('Resource uploaded successfully');
            setShowModal(false);
            fetchResources();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/resources/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success('Resource deleted');
                fetchResources();
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Manage Academic Resources 📚</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Upload New Resource
                </Button>
            </div>

            <div className="mb-4">
                <Button
                    variant={activeTab === 'all' ? 'primary' : 'outline-primary'}
                    className="me-2 rounded-pill"
                    onClick={() => setActiveTab('all')}
                >
                    All
                </Button>
                <Button
                    variant={activeTab === 'pending' ? 'warning' : 'outline-warning'}
                    className="me-2 rounded-pill"
                    onClick={() => setActiveTab('pending')}
                >
                    Pending {resources.filter(r => r.status === 'pending').length > 0 && <Badge bg="danger">{resources.filter(r => r.status === 'pending').length}</Badge>}
                </Button>
                <Button
                    variant={activeTab === 'approved' ? 'success' : 'outline-success'}
                    className="me-2 rounded-pill"
                    onClick={() => setActiveTab('approved')}
                >
                    Approved
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <Table responsive hover className="align-middle bg-white shadow-sm rounded">
                    <thead className="bg-light">
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Branch</th>
                            <th>Status</th>
                            <th>Downloads</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources
                            .filter(res => activeTab === 'all' || res.status === activeTab)
                            .map(res => (
                                <tr key={res._id}>
                                    <td>{res.title}</td>
                                    <td><Badge bg="info">{res.type}</Badge></td>
                                    <td>{res.branch}</td>
                                    <td>
                                        <Badge bg={
                                            res.status === 'approved' ? 'success' :
                                                res.status === 'pending' ? 'warning' : 'danger'
                                        }>
                                            {res.status}
                                        </Badge>
                                    </td>
                                    <td>{res.downloadCount}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            {res.status === 'pending' && (
                                                <>
                                                    <Button variant="outline-success" size="sm" onClick={() => handleStatusUpdate(res._id, 'approved')}>
                                                        Approve
                                                    </Button>
                                                    <Button variant="outline-warning" size="sm" onClick={() => handleStatusUpdate(res._id, 'rejected')}>
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(res._id)}>
                                                <FiTrash2 />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Upload Academic Resource</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Resource Title</Form.Label>
                                    <Form.Control
                                        required
                                        placeholder="e.g., Engineering Physics 2023 Paper"
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Select onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Branch</Form.Label>
                                    <Form.Select required onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                                        <option value="">Select Branch</option>
                                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Semester</Form.Label>
                                    <Form.Select onChange={(e) => setFormData({ ...formData, semester: e.target.value })}>
                                        {semesters.map(s => <option key={s} value={s}>{s} Sem</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Year</Form.Label>
                                    <Form.Control
                                        type="number"
                                        defaultValue={new Date().getFullYear()}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>PDF File</Form.Label>
                            <Form.Control
                                type="file"
                                accept=".pdf"
                                required
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                        <div className="text-end mt-4">
                            <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit" disabled={uploading}>
                                {uploading ? <Spinner size="sm" /> : 'Upload Resource'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ManageResources;
