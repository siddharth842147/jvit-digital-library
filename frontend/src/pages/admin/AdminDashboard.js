import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Badge, Button } from 'react-bootstrap';
import { FiUsers, FiBook, FiClock, FiDollarSign, FiActivity, FiArrowRight, FiCheckCircle, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { getDashboardStats } from '../../services/adminService';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await getDashboardStats();
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div style={{ padding: '3rem 0', background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 70px)' }}>
            <Container>
                <div className="mb-5">
                    <h1 style={{ fontWeight: 800 }}>Admin Command Center 🚀</h1>
                    <p className="text-muted">High-level overview of library health and circulation.</p>
                </div>

                {/* Main Stats Grid - 6 Cards as requested */}
                <Row className="g-4 mb-5">
                    <Col xs={6} md={4} lg={2}>
                        <Card className="border-0 shadow-sm h-100 text-center" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-3 p-md-4">
                                <div className="mb-2 mb-md-3 mx-auto" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.6rem', borderRadius: '12px', width: 'fit-content' }}>
                                    <FiUsers size={18} />
                                </div>
                                <h3 className="mb-1 fw-bold" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>{stats.overview.totalUsers}</h3>
                                <p className="text-muted mb-0 small uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Students</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={4} lg={2}>
                        <Card className="border-0 shadow-sm h-100 text-center" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-3 p-md-4">
                                <div className="mb-2 mb-md-3 mx-auto" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.6rem', borderRadius: '12px', width: 'fit-content' }}>
                                    <FiClock size={18} />
                                </div>
                                <h3 className="mb-1 fw-bold" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>{stats.overview.activeBorrows}</h3>
                                <p className="text-muted mb-0 small uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Borrowed</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={4} lg={2}>
                        <Card className="border-0 shadow-sm h-100 text-center" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-3 p-md-4">
                                <div className="mb-2 mb-md-3 mx-auto" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.6rem', borderRadius: '12px', width: 'fit-content' }}>
                                    <FiDollarSign size={18} />
                                </div>
                                <h3 className="mb-1 fw-bold" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>₹{stats.overview.totalRevenue}</h3>
                                <p className="text-muted mb-0 small uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Revenue</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={4} lg={2}>
                        <Card className="border-0 shadow-sm h-100 text-center" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-3 p-md-4">
                                <div className="mb-2 mb-md-3 mx-auto" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.6rem', borderRadius: '12px', width: 'fit-content' }}>
                                    <FiShield size={18} />
                                </div>
                                <h3 className="mb-1 fw-bold" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>{stats.overview.totalLibrarians}</h3>
                                <p className="text-muted mb-0 small uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Staff</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={4} lg={2}>
                        <Card className="border-0 shadow-sm h-100 text-center" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-3 p-md-4">
                                <div className="mb-2 mb-md-3 mx-auto" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.6rem', borderRadius: '12px', width: 'fit-content' }}>
                                    <FiBook size={18} />
                                </div>
                                <h3 className="mb-1 fw-bold" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>{stats.overview.totalBooks}</h3>
                                <p className="text-muted mb-0 small uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Books</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} md={4} lg={2}>
                        <Card className="border-0 shadow-sm h-100 text-center" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-3 p-md-4">
                                <div className="mb-2 mb-md-3 mx-auto" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.6rem', borderRadius: '12px', width: 'fit-content' }}>
                                    <FiAlertTriangle size={18} />
                                </div>
                                <h3 className="mb-1 fw-bold" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>{stats.overview.overdueBorrows}</h3>
                                <p className="text-muted mb-0 small uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Overdue</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-4">
                    {/* Recent Circulation Activities */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Header className="bg-transparent border-0 p-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <FiActivity style={{ color: 'var(--primary)' }} /> Recent Circulation
                                </h5>
                                <Badge bg="light" text="dark">Live Updates</Badge>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table hover className="align-middle border-0 mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="px-4 py-3 border-0 small text-muted">STUDENT</th>
                                                <th className="py-3 border-0 small text-muted">BOOK TITLE</th>
                                                <th className="py-3 border-0 small text-muted">TYPE</th>
                                                <th className="py-3 border-0 small text-muted text-end px-4">DATE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentActivities.recentBorrows.map((borrow) => (
                                                <tr key={borrow._id}>
                                                    <td className="px-4 py-3">
                                                        <div className="fw-bold">{borrow.user?.name}</div>
                                                        <small className="text-muted">{borrow.user?.email}</small>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold">{borrow.book?.title}</div>
                                                        <small className="text-muted">{borrow.book?.author}</small>
                                                    </td>
                                                    <td>
                                                        {borrow.status === 'returned' ? (
                                                            <Badge bg="success" pill className="d-flex align-items-center gap-1 w-fit">
                                                                <FiCheckCircle /> RETURNED
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="primary" pill className="d-flex align-items-center gap-1 w-fit">
                                                                <FiActivity /> ISSUED
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="text-end px-4 text-muted small">
                                                        {new Date(borrow.updatedAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Quick Management */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm" style={{ borderRadius: 'var(--radius-xl)' }}>
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Quick Management</h5>
                                <div className="d-grid gap-3">
                                    <Link to="/admin/books" className="btn btn-outline-primary d-flex align-items-center justify-content-between px-3 py-2">
                                        <span>Inventory Control</span> <FiArrowRight />
                                    </Link>
                                    <Link to="/admin/users" className="btn btn-outline-primary d-flex align-items-center justify-content-between px-3 py-2">
                                        <span>User Access</span> <FiArrowRight />
                                    </Link>
                                    <Link to="/admin/borrows" className="btn btn-outline-primary d-flex align-items-center justify-content-between px-3 py-2">
                                        <span>Active Issues</span> <FiArrowRight />
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminDashboard;
