import React from 'react';
import { Container, Row, Col, Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiBook, FiUsers, FiCreditCard, FiTrendingUp } from 'react-icons/fi';

const Home = () => {
    const features = [
        {
            icon: <FiBook size={40} />,
            title: 'Vast Collection',
            description: 'Access thousands of books across multiple categories and genres'
        },
        {
            icon: <FiUsers size={40} />,
            title: 'Easy Management',
            description: 'Simple and intuitive interface for borrowing and returning books'
        },
        {
            icon: <FiCreditCard size={40} />,
            title: 'Online Payments',
            description: 'Secure payment integration for fines and membership fees'
        },
        {
            icon: <FiTrendingUp size={40} />,
            title: 'Track Progress',
            description: 'Monitor your reading history and manage borrowed books'
        }
    ];

    return (
        <div>
            {/* Hero Section */}
            <section
                style={{
                    background: 'var(--gradient-premium)',
                    color: 'white',
                    padding: '8rem 0',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div className="hero-pattern" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }}></div>
                <Container className="position-relative">
                    <Row className="align-items-center">
                        <Col lg={7} className="fade-in">
                            <Badge bg="accent" className="mb-4 px-3 py-2 text-dark" style={{ fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 800 }}>
                                WELCOME TO THE FUTURE OF KNOWLEDGE
                            </Badge>
                            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                                Jnana Vikas <br />
                                <span style={{ color: 'var(--accent)' }}>Digital Library</span>
                            </h1>
                            <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.9, maxWidth: '600px', fontWeight: 300 }}>
                                Empowering the students of JVIT with seamless access to global resources, research papers, and the finest literature.
                            </p>
                            <div className="d-flex flex-wrap gap-3">
                                <Link to="/books" className="btn btn-light btn-lg px-5 py-3 shadow-lg" style={{ borderRadius: 'var(--radius-md)', fontWeight: 700 }}>
                                    Explore Archive
                                </Link>
                                <Link to="/register" className="btn btn-outline-light btn-lg px-5 py-3" style={{ borderRadius: 'var(--radius-md)', border: '2px solid rgba(255,255,255,0.3)' }}>
                                    Member Join
                                </Link>
                            </div>
                        </Col>
                        <Col lg={5} className="d-none d-lg-block slide-in-right">
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                {/* Decorative Ring */}
                                <div style={{
                                    position: 'absolute',
                                    width: '380px',
                                    height: '380px',
                                    border: '2px dashed rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    animation: 'spin 20s linear infinite'
                                }}></div>

                                <div style={{
                                    width: '320px',
                                    height: '320px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    padding: '20px',
                                    boxShadow: '0 0 50px rgba(0,0,0,0.3), inset 0 0 20px rgba(6, 95, 70, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    zIndex: 2,
                                    border: '8px solid rgba(255,255,255,0.1)'
                                }}>
                                    <img
                                        src="/logo.jpg"
                                        alt="JVIT Seal"
                                        style={{ width: '90%', height: 'auto', objectFit: 'contain' }}
                                        onError={(e) => { e.target.src = "https://placehold.co/400x400/065f46/ffffff?text=JVIT"; }}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section style={{ padding: '8rem 0', background: 'var(--bg-secondary)' }}>
                <Container>
                    <div className="text-center mb-5 pb-4">
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800 }}>Academic Excellence 🎓</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
                            Advanced tools and resources designed to support your scholarly journey at Jnana Vikas Institute of Technology.
                        </p>
                    </div>

                    <Row className="g-5">
                        {features.map((feature, index) => (
                            <Col key={index} md={6} lg={3}>
                                <Card
                                    className="border-0 shadow-md h-100 text-center p-4"
                                    style={{
                                        borderRadius: 'var(--radius-lg)',
                                        animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`,
                                        background: 'var(--bg-primary)'
                                    }}
                                >
                                    <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'inline-block' }}>
                                        <div style={{ padding: '1.5rem', background: 'rgba(6, 95, 70, 0.05)', borderRadius: '20px' }}>
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>{feature.title}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        {feature.description}
                                    </p>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Stats Section */}
            <section
                style={{
                    background: 'var(--bg-primary)',
                    padding: '6rem 0',
                    borderTop: '1px solid var(--border-color)',
                    borderBottom: '1px solid var(--border-color)',
                    position: 'relative'
                }}
            >
                {/* Decorative background number */}
                <div style={{ position: 'absolute', top: '10%', right: '5%', fontSize: '15rem', fontWeight: 900, color: 'rgba(0,0,0,0.02)', pointerEvents: 'none', select: 'none' }}>01</div>

                <Container>
                    <div className="text-center mb-5">
                        <Badge bg="primary" className="mb-3">BY THE NUMBERS</Badge>
                        <h2 style={{ fontWeight: 800 }}>Growing Every Day</h2>
                    </div>
                    <Row className="text-center g-4">
                        <Col md={3} sm={6}>
                            <div className="stat-card" style={{ background: 'var(--gradient-premium)' }}>
                                <div style={{ opacity: 0.2, position: 'absolute', top: -10, left: -10 }}><FiBook size={80} /></div>
                                <h2>10K+</h2>
                                <p>Resources</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="stat-card" style={{ background: 'var(--gradient-secondary)' }}>
                                <div style={{ opacity: 0.2, position: 'absolute', top: -10, left: -10 }}><FiUsers size={80} /></div>
                                <h2>5K+</h2>
                                <p>Students</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="stat-card" style={{ background: 'var(--gradient-success)' }}>
                                <div style={{ opacity: 0.2, position: 'absolute', top: -10, left: -10 }}><FiTrendingUp size={80} /></div>
                                <h2>50K+</h2>
                                <p>Issues</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="stat-card" style={{ background: 'var(--gradient-dark)' }}>
                                <div style={{ opacity: 0.2, position: 'absolute', top: -10, left: -10 }}><FiCreditCard size={80} /></div>
                                <h2>99%</h2>
                                <p>Satisfaction</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '5rem 0' }}>
                <Container>
                    <div
                        className="card card-gradient text-center"
                        style={{ padding: '4rem 2rem' }}
                    >
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Ready to Start Your Reading Journey?
                        </h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
                            Join thousands of readers and discover your next favorite book today
                        </p>
                        <div>
                            <Link to="/register" className="btn btn-light btn-lg">
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default Home;
