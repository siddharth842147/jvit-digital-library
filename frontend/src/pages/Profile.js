import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Badge } from 'react-bootstrap';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiSave, FiEdit2, FiCamera, FiHash, FiLayers, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        usn: user?.usn || '',
        year: user?.year || 'N/A',
        branch: user?.branch || '',
        profilePic: user?.profilePic || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                toast.error('Image size should be less than 1MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePic: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const result = await updateProfile(formData);
            if (result.success) {
                setEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const triggerFileSelect = () => {
        if (editing) {
            fileInputRef.current.click();
        }
    };

    return (
        <div style={{ padding: '3rem 0', background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col lg={10} xl={9}>
                        {/* Header Card */}
                        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
                            <div style={{ height: '140px', background: 'var(--gradient-primary)' }}></div>
                            <Card.Body className="p-4 pt-0 text-center" style={{ marginTop: '-70px' }}>
                                <div className="mb-3 d-inline-block position-relative">
                                    <div className="p-1 bg-white rounded-circle shadow-sm">
                                        <div
                                            style={{
                                                width: '140px',
                                                height: '140px',
                                                background: '#f1f5f9',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                border: '4px solid white',
                                                cursor: editing ? 'pointer' : 'default'
                                            }}
                                            onClick={triggerFileSelect}
                                        >
                                            {formData.profilePic ? (
                                                <img src={formData.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                                    {user?.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {editing && (
                                        <div
                                            className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle shadow-sm"
                                            style={{ cursor: 'pointer', marginBottom: '10px', marginRight: '10px' }}
                                            onClick={triggerFileSelect}
                                        >
                                            <FiCamera size={18} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleProfilePicChange}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                </div>
                                <h2 className="fw-bold mb-1">{user?.name}</h2>
                                <p className="text-muted mb-3 d-flex align-items-center justify-content-center gap-2">
                                    <FiMail size={16} /> {user?.email}
                                </p>
                                <div className="d-flex justify-content-center gap-2">
                                    <Badge bg="primary" className="px-3 py-2" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {user?.role}
                                    </Badge>
                                    <Badge bg="success" className="px-3 py-2" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {user?.membershipStatus || 'Active Member'}
                                    </Badge>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Details Card */}
                        <Card className="border-0 shadow-sm" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Header className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <FiUser style={{ color: 'var(--primary)' }} /> {user?.role === 'student' ? 'Academic & Personal Details' : 'Professional & Personal Details'}
                                </h5>
                                {!editing && (
                                    <Button variant="link" className="text-decoration-none p-0 d-flex align-items-center gap-2" onClick={() => setEditing(true)}>
                                        <FiEdit2 size={18} /> Edit Profile
                                    </Button>
                                )}
                            </Card.Header>
                            <Card.Body className="p-4 pt-2">
                                <Form onSubmit={handleSubmit}>
                                    <Row className="g-4">
                                        {/* Basic Info */}
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted mb-2">FULL NAME</Form.Label>
                                                <div className="position-relative">
                                                    <FiUser className="position-absolute translate-middle-y top-50 ms-3 text-muted" />
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        disabled={!editing}
                                                        style={{ paddingLeft: '2.75rem', borderRadius: 'var(--radius-md)', height: '50px' }}
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted mb-2">PHONE NUMBER</Form.Label>
                                                <div className="position-relative">
                                                    <FiPhone className="position-absolute translate-middle-y top-50 ms-3 text-muted" />
                                                    <Form.Control
                                                        type="text"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        disabled={!editing}
                                                        style={{ paddingLeft: '2.75rem', borderRadius: 'var(--radius-md)', height: '50px' }}
                                                        placeholder="Enter 10-digit phone number"
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>

                                        {/* Academic Info - ONLY FOR STUDENTS */}
                                        {user?.role === 'student' && (
                                            <>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-muted mb-2">USN / REGISTER NO</Form.Label>
                                                        <div className="position-relative">
                                                            <FiHash className="position-absolute translate-middle-y top-50 ms-3 text-muted" />
                                                            <Form.Control
                                                                type="text"
                                                                name="usn"
                                                                value={formData.usn}
                                                                onChange={handleChange}
                                                                disabled={!editing}
                                                                style={{ paddingLeft: '2.75rem', borderRadius: 'var(--radius-md)', height: '50px' }}
                                                                placeholder="e.g. 1MS20CS001"
                                                            />
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-muted mb-2">CURRENT YEAR</Form.Label>
                                                        <div className="position-relative">
                                                            <FiCalendar className="position-absolute translate-middle-y top-50 ms-3 text-muted" />
                                                            <Form.Select
                                                                name="year"
                                                                value={formData.year}
                                                                onChange={handleChange}
                                                                disabled={!editing}
                                                                style={{ paddingLeft: '2.75rem', borderRadius: 'var(--radius-md)', height: '50px' }}
                                                            >
                                                                <option value="N/A">Select Year</option>
                                                                <option value="1st Year">1st Year</option>
                                                                <option value="2nd Year">2nd Year</option>
                                                                <option value="3rd Year">3rd Year</option>
                                                                <option value="4th Year">4th Year</option>
                                                            </Form.Select>
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-muted mb-2">BRANCH / DEPT</Form.Label>
                                                        <div className="position-relative">
                                                            <FiLayers className="position-absolute translate-middle-y top-50 ms-3 text-muted" />
                                                            <Form.Control
                                                                type="text"
                                                                name="branch"
                                                                value={formData.branch}
                                                                onChange={handleChange}
                                                                disabled={!editing}
                                                                style={{ paddingLeft: '2.75rem', borderRadius: 'var(--radius-md)', height: '50px' }}
                                                                placeholder="e.g. CSE / ISE"
                                                            />
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                            </>
                                        )}

                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted mb-2">PERMANENT ADDRESS</Form.Label>
                                                <div className="position-relative">
                                                    <FiMapPin className="position-absolute ms-3 text-muted" style={{ top: '15px' }} />
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        disabled={!editing}
                                                        style={{ paddingLeft: '2.75rem', borderRadius: 'var(--radius-md)' }}
                                                        placeholder="Enter your full residential address"
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted mb-2">MEMBER ID (SYSTEM GEN)</Form.Label>
                                                <div className="position-relative">
                                                    <FiShield className="position-absolute translate-middle-y top-50 ms-3 text-muted" />
                                                    <Form.Control
                                                        type="text"
                                                        value={user?._id.toUpperCase()}
                                                        disabled={true}
                                                        style={{ paddingLeft: '2.75rem', borderRadius: 'var(--radius-md)', height: '50px', background: '#f8fafc' }}
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>

                                        {editing && (
                                            <Col md={12} className="d-flex gap-2 mt-4">
                                                <Button
                                                    variant="primary"
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-5 py-2 fw-bold d-flex align-items-center gap-2"
                                                    style={{ borderRadius: 'var(--radius-lg)' }}
                                                >
                                                    {loading ? <Spinner size="sm" /> : <FiSave />} Update Profile
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => setEditing(false)}
                                                    className="px-4 py-2"
                                                    style={{ borderRadius: 'var(--radius-lg)' }}
                                                >
                                                    Cancel
                                                </Button>
                                            </Col>
                                        )}
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="mt-4 text-center">
                            <p className="text-muted small">
                                <FiShield className="me-1" /> Your data is secure. For sensitive changes contact the library admin.
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Profile;
