import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { authAPI } from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = await authAPI.register(formData);
      // Registration successful, log in the user
      localStorage.setItem('token', token);
      // Decode token to get user role and redirect accordingly
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const user = JSON.parse(jsonPayload);
      if (user.role === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else if (user.role === 'nurse' || user.role === 'caregiver') {
        navigate('/provider/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                <FaUser /> Register for HomeCare Connect
              </Card.Title>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>
                    <FaUser /> Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>
                    <FaEnvelope /> Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>
                    <FaLock /> Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Create a password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="role">
                  <Form.Label>
                    <FaUser /> I am a:
                  </Form.Label>
                  <Form.Select
                    as="select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="client">Client (seeking care)</option>
                    <option value="nurse">Nurse (providing care)</option>
                    <option value="caregiver">Caregiver (providing care)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>
                    <FaPhone /> Phone Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter your phone number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>
                    <FaMapMarkerAlt /> Address
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your street address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Row className="mb-3">
                  <Form.Group className="me-3" controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="me-3" controlId="state">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter state (e.g., CA)"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      maxLength={2}
                    />
                  </Form.Group>

                  <Form.Group controlId="zipCode">
                    <Form.Label>ZIP Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter ZIP code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      maxLength={5}
                    />
                  </Form.Group>
                </Form.Row>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Login here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;