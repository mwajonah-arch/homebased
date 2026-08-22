import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaUserNurse, FaUserInjured, FaCalendarAlt } from 'react-icons/fa';

const HomePage = () => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center mb-4">HomeCare Connect</h1>
          <p className="text-center lead mb-5">
            Connecting people in need of nursing care with qualified nurses and caregivers.
          </p>

          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-center">
                    <FaHeart size={32} className="mb-3" />
                    <h3>Find Care</h3>
                  </Card.Title>
                  <Card.Text className="flex-grow-1 text-center">
                    Browse through our list of verified nurses and caregivers offering various services.
                  </Card.Text>
                  <Button variant="primary" className="mt-auto" as={Link} to="/services">
                    Browse Services
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-center">
                    <FaUserNurse size={32} className="mb-3" />
                    <h3>Become a Provider</h3>
                  </Card.Title>
                  <Card.Text className="flex-grow-1 text-center">
                    Are you a qualified nurse or caregiver? Join our platform to offer your services.
                  </Card.Text>
                  <Button variant="outline-primary" className="mt-auto" as={Link} to="/register">
                    Sign Up as Provider
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-center">
                    <FaCalendarAlt size={32} className="mb-3" />
                    <h3>Manage Bookings</h3>
                  </Card.Title>
                  <Card.Text className="flex-grow-1 text-center">
                    Keep track of your bookings, schedule, and payments in one place.
                  </Card.Text>
                  <Button variant="outline-primary" className="mt-auto" as={Link} to="/login">
                    Login to Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-5">
            <Col>
              <h2 className="mb-4">How It Works</h2>
              <Row className="g-4">
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <FaUserInjured size={48} className="mb-3" />
                    <h4>1. Find Care</h4>
                    <p>Search for nurses and caregivers by service type, location, and availability.</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <FaHeart size={48} className="mb-3" />
                    <h4>2. Book Service</h4>
                    <p>Select a provider, choose a date and time, and book your service securely.</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <FaCalendarAlt size={48} className="mb-3" />
                    <h4>3. Receive Care</h4>
                    <p>Enjoy professional care in the comfort of your home or at the provider's location.</p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;