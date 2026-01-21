import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Spinner } from 'react-bootstrap';
import { FiBook, FiClock, FiDollarSign, FiUser, FiActivity, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getMyBorrowedBooks } from '../services/borrowService';
import { Link, Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalBorrowed: 0,
        overdue: 0,
        pendingFines: 0,
        recentBooks: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await getMyBorrowedBooks();
                const borrows = response.data;

                setStats({
                    totalBorrowed: borrows.length,
                    overdue: borrows.filter(b => b.status === 'overdue').length,
                    pendingFines: user?.totalFines || 0,
                    recentBooks: borrows.slice(0, 3)
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'student') {
            fetchDashboardData();
        } else if (user) {
            setLoading(false);
        }
    }, [user]);

    if (user && user.role !== 'student') {
        return <Navigate to="/admin/dashboard" />;
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div style={{ padding: '3rem 0', background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)' }}>
            <Container>
                <div className="mb-5">
                    <h1 style={{ fontWeight: 800 }}>Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
                    <p className="text-muted">Here's an overview of your library activity.</p>
                </div>

                {/* Stats Cards */}
                <Row className="g-4 mb-5">
                    <Col md={4}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-4 d-flex align-items-center gap-4">
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '1.25rem', borderRadius: '20px' }}>
                                    <FiBook size={32} />
                                </div>
                                <div>
                                    <h2 className="mb-0 fw-bold">{stats.totalBorrowed}</h2>
                                    <p className="text-muted mb-0">Books Borrowed</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-4 d-flex align-items-center gap-4">
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1.25rem', borderRadius: '20px' }}>
                                    <FiClock size={32} />
                                </div>
                                <div>
                                    <h2 className="mb-0 fw-bold">{stats.overdue}</h2>
                                    <p className="text-muted mb-0">Overdue Books</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-4 d-flex align-items-center gap-4">
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1.25rem', borderRadius: '20px' }}>
                                    <FiDollarSign size={32} />
                                </div>
                                <div>
                                    <h2 className="mb-0 fw-bold">₹{stats.pendingFines}</h2>
                                    <p className="text-muted mb-0">Pending Fines</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-4">
                    {/* Recent Activity */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Header className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <FiActivity style={{ color: 'var(--primary)' }} /> Currently Reading
                                </h5>
                                <Link to="/my-books" className="text-decoration-none small fw-bold">View All <FiArrowRight /></Link>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {stats.recentBooks.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table hover className="align-middle border-0 mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="px-4 py-3 border-0">Book</th>
                                                    <th className="py-3 border-0">Issue Date</th>
                                                    <th className="py-3 border-0">Due Date</th>
                                                    <th className="py-3 border-0 text-end px-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentBooks.map((borrow) => (
                                                    <tr key={borrow._id}>
                                                        <td className="px-4 py-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <img
                                                                    src={borrow.book.coverImage}
                                                                    alt=""
                                                                    style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                                                                />
                                                                <div>
                                                                    <div className="fw-bold">{borrow.book.title}</div>
                                                                    <small className="text-muted">{borrow.book.author}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                                                        <td>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                                                        <td className="text-end px-4">
                                                            <Badge bg={borrow.status === 'overdue' ? 'danger' : 'success'} pill>
                                                                {borrow.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted mb-3">No active borrows found.</p>
                                        <Link to="/books" className="btn btn-outline-primary btn-sm px-4">Browse Books</Link>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Quick Profile */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-4 text-center">
                                <div className="mb-4 d-inline-block p-1 bg-light rounded-circle shadow-sm">
                                    <div
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            background: 'var(--gradient-primary)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '2.5rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {user?.name.charAt(0)}
                                    </div>
                                </div>
                                <h4 className="fw-bold mb-1">{user?.name}</h4>
                                <p className="text-muted small mb-4">{user?.email}</p>

                                <Card className="bg-light border-0 mb-4" style={{ borderRadius: 'var(--radius-lg)' }}>
                                    <Card.Body className="p-3 text-start">
                                        <div className="d-flex justify-content-between mb-2">
                                            <small className="text-muted">Membership</small>
                                            <Badge bg="success" pill>Active</Badge>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <small className="text-muted">Member Since</small>
                                            <small className="fw-bold">{new Date(user?.createdAt).toLocaleDateString()}</small>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Link to="/profile" className="btn btn-primary w-100 mb-2">
                                    <FiUser className="me-2" /> Edit Profile
                                </Link>
                                {stats.pendingFines > 0 && (
                                    <Link to="/payment" className="btn btn-danger w-100">
                                        <FiDollarSign className="me-2" /> Pay Fines (₹{stats.pendingFines})
                                    </Link>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Dashboard;
