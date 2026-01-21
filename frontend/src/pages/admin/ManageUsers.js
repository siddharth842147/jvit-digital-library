import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { FiUsers, FiSearch, FiEdit2, FiTrash2, FiShield, FiUserPlus, FiUser, FiMapPin, FiPhone, FiLock, FiPlus } from 'react-icons/fi';
import { getAllUsers, updateUser, deleteUser, createUser } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const { user: loggedInUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isAdmin = loggedInUser?.role === 'admin';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student',
        membershipStatus: 'active',
        address: ''
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers({ search: searchTerm });
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleOpenCreate = () => {
        setIsEdit(false);
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            role: 'student',
            membershipStatus: 'active',
            address: ''
        });
        setShowModal(true);
    };

    const handleOpenEdit = (user) => {
        setIsEdit(true);
        setCurrentUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Password not needed for simple details update
            phone: user.phone || '',
            role: user.role,
            membershipStatus: user.membershipStatus,
            address: user.address || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id, targetRole) => {
        // Librarian check: Can only delete students
        if (loggedInUser.role === 'librarian' && targetRole !== 'student') {
            toast.error('Librarians can only remove students');
            return;
        }

        if (window.confirm('Delete this user? They will lose all access.')) {
            try {
                await deleteUser(id);
                toast.success('User removed');
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Delete failed');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateUser(currentUser._id, formData);
                toast.success('Member updated');
            } else {
                await createUser(formData);
                toast.success('New member registered and notified via email!');
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div style={{ padding: '3rem 0', background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)' }}>
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 style={{ fontWeight: 800 }}>Manage Members 👥</h1>
                        <p className="text-muted">Review library access and student memberships.</p>
                    </div>
                    <Button variant="primary" className="d-flex align-items-center gap-2 px-4 shadow-sm" onClick={handleOpenCreate}>
                        <FiPlus /> Add Member
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 'var(--radius-xl)' }}>
                    <Card.Body className="p-3">
                        <Form onSubmit={handleSearch}>
                            <Row className="g-3">
                                <Col md={12}>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FiSearch className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search by name, email, or USN..."
                                            className="border-start-0"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <Button variant="primary" type="submit">Filter List</Button>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Users Table */}
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
                                            <th className="px-4 py-3 border-0 small text-muted">MEMBER</th>
                                            <th className="py-3 border-0 small text-muted">ROLE</th>
                                            <th className="py-3 border-0 small text-muted">STATUS</th>
                                            <th className="py-3 border-0 small text-muted">FINES</th>
                                            <th className="py-3 border-0 small text-muted text-end px-4">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id}>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                                                            style={{ width: '40px', height: '40px', background: 'var(--gradient-primary)', fontSize: '0.9rem' }}
                                                        >
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold">{u.name}</div>
                                                            <small className="text-muted">{u.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg={u.role === 'admin' ? 'dark' : u.role === 'librarian' ? 'info' : 'light'} text={u.role === 'student' ? 'dark' : 'white'} className="text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                                        {u.role}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={u.membershipStatus === 'active' ? 'success' : 'danger'} pill>
                                                        {u.membershipStatus}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <span className={u.totalFines > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                                                        ₹{u.totalFines || 0}
                                                    </span>
                                                </td>
                                                <td className="text-end px-4">
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <Button variant="outline-primary" size="sm" onClick={() => handleOpenEdit(u)}>
                                                            <FiEdit2 />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDelete(u._id, u.role)}
                                                            disabled={u._id === loggedInUser.id || (loggedInUser.role === 'librarian' && u.role !== 'student')}
                                                        >
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
                        {!loading && users.length === 0 && (
                            <div className="text-center py-5">
                                <FiUsers size={48} className="text-muted mb-3" />
                                <h5>No members found</h5>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Edit Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold">{isEdit ? 'Update Member Access' : 'Register New Member'}</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body className="px-4 pb-4">
                            {!isEdit && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted uppercase">Full Name</Form.Label>
                                        <Form.Control
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted uppercase">Email Address</Form.Label>
                                        <Form.Control
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted uppercase">Temporary Password</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text><FiLock /></InputGroup.Text>
                                            <Form.Control
                                                required
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="Enter secure password"
                                            />
                                        </InputGroup>
                                        <Form.Text className="text-muted">A confirmation email will be sent to the user.</Form.Text>
                                    </Form.Group>
                                    <hr className="my-4" />
                                </>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted uppercase">Assign Role</Form.Label>
                                <div className="d-flex gap-3">
                                    {(isAdmin ? ['student', 'librarian', 'admin'] : ['student']).map(r => (
                                        <Form.Check
                                            key={r}
                                            type="radio"
                                            label={r.charAt(0).toUpperCase() + r.slice(1)}
                                            name="role"
                                            checked={formData.role === r}
                                            onChange={() => setFormData({ ...formData, role: r })}
                                            id={`role-${r}`}
                                        />
                                    ))}
                                </div>
                                {!isAdmin && <Form.Text className="text-info">Search/Delete restricted to Students for Librarians.</Form.Text>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted uppercase">Membership Status</Form.Label>
                                <Form.Select
                                    value={formData.membershipStatus}
                                    onChange={(e) => setFormData({ ...formData, membershipStatus: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive / Expired</option>
                                    <option value="suspended">Suspended (Due to missing books)</option>
                                </Form.Select>
                            </Form.Group>

                            <hr className="my-4" />

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted uppercase">Contact Info</Form.Label>
                                <InputGroup className="mb-2">
                                    <InputGroup.Text><FiPhone /></InputGroup.Text>
                                    <Form.Control
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Phone number"
                                    />
                                </InputGroup>
                                <InputGroup>
                                    <InputGroup.Text><FiMapPin /></InputGroup.Text>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Address"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer className="border-0 px-4 pb-4">
                            <Button variant="light" onClick={() => setShowModal(false)}>Discard</Button>
                            <Button variant="primary" type="submit" className="px-4 fw-bold shadow-sm">
                                {isEdit ? 'Apply Changes' : 'Register Member'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </Container>
        </div>
    );
};

export default ManageUsers;
