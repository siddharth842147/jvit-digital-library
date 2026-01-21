import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar as BSNavbar, NavDropdown } from 'react-bootstrap';
import { FiBook, FiSun, FiMoon, FiUser, FiLogOut, FiHome, FiGrid } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <BSNavbar expand="lg" className="navbar" sticky="top">
            <Container>
                <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-3">
                    <div className="logo-container" style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'white',
                        padding: '4px',
                        boxShadow: 'var(--shadow-sm)',
                        border: '2px solid var(--primary-light)'
                    }}>
                        <img
                            src="/logo.jpg"
                            alt="JVIT Logo"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.src = "https://placehold.co/150x150/065f46/ffffff?text=JVIT"; }}
                        />
                    </div>
                    <div className="d-flex flex-column justify-content-center">
                        <span style={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1, color: 'var(--primary)', letterSpacing: '-0.5px' }}>JVIT</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Knowledge Hub</span>
                    </div>
                </BSNavbar.Brand>

                <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

                <BSNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center gap-3">
                        <Nav.Link as={Link} to="/">
                            <FiHome className="me-1" /> Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/books">
                            <FiBook className="me-1" /> Books
                        </Nav.Link>

                        {isAuthenticated ? (
                            <>
                                <Nav.Link as={Link} to="/dashboard">
                                    <FiGrid className="me-1" /> Dashboard
                                </Nav.Link>

                                {user?.role === 'student' && (
                                    <Nav.Link as={Link} to="/my-books">
                                        My Books
                                    </Nav.Link>
                                )}

                                {(user?.role === 'admin' || user?.role === 'librarian') && (
                                    <NavDropdown title="Admin" id="admin-dropdown">
                                        <NavDropdown.Item as={Link} to="/admin/dashboard">
                                            Dashboard
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/books">
                                            Manage Books
                                        </NavDropdown.Item>
                                        {user?.role === 'admin' && (
                                            <NavDropdown.Item as={Link} to="/admin/users">
                                                Manage Users
                                            </NavDropdown.Item>
                                        )}
                                        <NavDropdown.Item as={Link} to="/admin/borrows">
                                            Borrow Management
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item as={Link} to="/admin/verify-payments">
                                            Verify Payments
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                )}

                                <NavDropdown
                                    title={
                                        <span>
                                            <FiUser className="me-1" /> {user?.name}
                                        </span>
                                    }
                                    id="user-dropdown"
                                >
                                    <NavDropdown.Item as={Link} to="/profile">
                                        Profile
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/payment-history">
                                        Payment History
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>
                                        <FiLogOut className="me-1" /> Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary">
                                    Register
                                </Link>
                            </>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="btn btn-outline"
                            style={{
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
                        </button>
                    </Nav>
                </BSNavbar.Collapse>
            </Container>
        </BSNavbar>
    );
};

export default Navbar;
