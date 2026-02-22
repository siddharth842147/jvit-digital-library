import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { FiDownload, FiSearch, FiUpload } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AcademicResources = () => {
    const { isAuthenticated, user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [filters, setFilters] = useState({
        branch: '',
        semester: '',
        type: ''
    });

    const [uploadFormData, setUploadFormData] = useState({
        title: '',
        type: 'Notes',
        branch: '',
        semester: '1st',
        year: new Date().getFullYear(),
        description: '',
        file: null
    });

    const branches = ['CSE', 'ISE', 'ECE', 'ME', 'CE', 'AI & ML', 'Basic Science'];
    const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
    const types = ['Question Paper', 'Notes', 'Lab Manual', 'Other'];

    const fetchResources = React.useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters);
            const config = {};

            // Add token if logged in to see pending resources (if admin/librarian)
            const token = localStorage.getItem('token');
            if (token) {
                config.headers = { Authorization: `Bearer ${token}` };
            }

            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/resources?${queryParams}`, config);
            setResources(data.data);
        } catch (error) {
            toast.error('Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchResources();
    }, [filters, fetchResources]);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const data = new FormData();
            Object.keys(uploadFormData).forEach(key => {
                if (key === 'file') {
                    data.append('file', uploadFormData[key]);
                } else {
                    data.append(key, uploadFormData[key]);
                }
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            await axios.post(`${process.env.REACT_APP_API_URL}/resources`, data, config);

            if (user.role === 'admin' || user.role === 'librarian') {
                toast.success('Resource uploaded successfully!');
            } else {
                toast.success('Resource uploaded! It will be visible once approved by a librarian.');
            }

            setShowUploadModal(false);
            fetchResources();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (id, fileUrl, fileName) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/resources/${id}/download`);
            // Open in new tab for download
            window.open(`${process.env.REACT_APP_API_URL.replace('/api', '')}${fileUrl}`, '_blank');
        } catch (error) {
            console.error('Download tracking failed', error);
        }
    };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-bold mb-1">Academic Resource Hub 🎓</h1>
                    <p className="text-muted">Download previous year question papers, notes, and lab manuals.</p>
                </div>
                {isAuthenticated && (
                    <Button
                        variant="primary"
                        className="rounded-pill px-4 d-flex align-items-center gap-2"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <FiUpload /> Upload Resource
                    </Button>
                )}
            </div>

            <Card className="shadow-sm border-0 mb-5 p-4">
                <Row className="g-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small fw-bold">Branch</Form.Label>
                            <Form.Select
                                value={filters.branch}
                                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                            >
                                <option value="">All Branches</option>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small fw-bold">Semester</Form.Label>
                            <Form.Select
                                value={filters.semester}
                                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                            >
                                <option value="">All Semesters</option>
                                {semesters.map(s => <option key={s} value={s}>{s} Sem</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small fw-bold">Resource Type</Form.Label>
                            <Form.Select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">All Types</option>
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Card>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : resources.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4">
                    <FiSearch size={48} className="text-muted mb-3" />
                    <h4>No resources found</h4>
                    <p className="text-muted">Try adjusting your filters or check back later.</p>
                </div>
            ) : (
                <Row className="g-4">
                    {resources.map((resource) => (
                        <Col key={resource._id} md={6} lg={4}>
                            <Card className="h-100 shadow-sm border-0 resource-card overflow-hidden">
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <Badge bg="primary-light" className="text-primary px-3 py-2 rounded-pill">
                                            {resource.type}
                                        </Badge>
                                        <div className="text-muted small">
                                            {resource.downloadCount} Downloads
                                        </div>
                                    </div>
                                    <h5 className="fw-bold mb-2">{resource.title}</h5>
                                    <div className="small text-muted mb-4">
                                        <div><strong>Branch:</strong> {resource.branch}</div>
                                        <div><strong>Semester:</strong> {resource.semester}</div>
                                        <div><strong>Year:</strong> {resource.year}</div>
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handleDownload(resource._id, resource.fileUrl, resource.fileName)}
                                    >
                                        <FiDownload /> Download PDF
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Upload Resource</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleUploadSubmit}>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Title</Form.Label>
                                    <Form.Control
                                        required
                                        placeholder="e.g. CSE 4th Sem Math Notes"
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Type</Form.Label>
                                    <Form.Select
                                        value={uploadFormData.type}
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, type: e.target.value })}
                                    >
                                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Branch</Form.Label>
                                    <Form.Select
                                        required
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, branch: e.target.value })}
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Semester</Form.Label>
                                    <Form.Select
                                        value={uploadFormData.semester}
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, semester: e.target.value })}
                                    >
                                        {semesters.map(s => <option key={s} value={s}>{s} Sem</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Year</Form.Label>
                                    <Form.Control
                                        type="number"
                                        defaultValue={new Date().getFullYear()}
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, year: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">File (PDF, Images, etc.)</Form.Label>
                                    <Form.Control
                                        type="file"
                                        required
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, file: e.target.files[0] })}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                    <Form.Text className="text-muted">
                                        You can upload PDF, Word docs or photos.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                            <Button variant="primary" type="submit" disabled={uploading}>
                                {uploading ? <Spinner size="sm" /> : 'Upload Now'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AcademicResources;
