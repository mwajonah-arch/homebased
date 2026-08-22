import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Form, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { serviceAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaHeart, FaComments } from 'react-icons/fa';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    duration: 1,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    specialInstructions: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const fetchService = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const serviceData = await serviceAPI.getServiceById(id);
      setService(serviceData);
    } catch (err) {
      setError('Failed to fetch service details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    // Validate form
    if (!bookingForm.bookingDate || !bookingForm.startTime || !bookingForm.endTime ||
        !bookingForm.address || !bookingForm.city || !bookingForm.state || !bookingForm.zipCode) {
      setBookingError('Please fill in all required fields');
      setBookingLoading(false);
      return;
    }

    try {
      await bookingAPI.createBooking({
        serviceId: id,
        ...bookingForm
      });
      setBookingSuccess('Booking created successfully!');
      // Reset form after successful booking
      setBookingForm({
        bookingDate: '',
        startTime: '',
        endTime: '',
        duration: 1,
        address: '',
        city: '',
        state: '',
        zipCode: '',
        specialInstructions: ''
      });
      // Redirect to client dashboard after booking (if user is client)
      if (user && user.role === 'client') {
        setTimeout(() => {
          navigate('/client/dashboard');
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Failed to create booking';
      setBookingError(errorMessage);
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!service) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col>
            <Alert variant="danger">{error || 'Service not found'}</Alert>
            <Link to="/services" className="btn btn-primary mt-3">
              Go Back to Services
            </Link>
          </Col>
        </Row>
      </Container>
    );
  }

  // Check if user is authorized to book (client only)
  const isClient = user && user.role === 'client';
  const isProvider = user && (user.role === 'nurse' || user.role === 'caregiver');
  const isOwner = isProvider && service.provider.id === user.id;

  return (
    <Container className="mt-5">
      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Img variant="top" src={service.images && service.images[0] ? service.images[0] : '/placeholder-image.jpg'} alt={service.title} />
            <Card.Body>
              <Card.Title>{service.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                <FaUser /> By {service.provider.name}
              </Card.Subtitle>
              <Card.Text>
                {service.description}
              </Card.Text>
            </Card.Body>
            <ListGroup className="list-group-flush">
              <ListGroup.Item>
                <FaMapMarkerAlt /> {service.location}, {service.city}, {service.state} {service.zipCode}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaCalendarAlt /> Duration: {service.duration}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaClock /> Hourly Rate: $${service.price_per_hour}
              </ListGroup.Item>
              <ListGroup.Item>
                <FaHeart /> Rating: {service.ratings?.toFixed(1) ?? 0} ({service.total_reviews ?? 0} reviews)
              </ListGroup.Item>
              {service.specialties?.length > 0 && (
                <ListGroup.Item>
                  <FaComments /> Specialties: {service.specialties.join(', ')}
                </ListGroup.Item>
              )}
            </ListGroup>

            {(!isOwner && !bookingSuccess) && (
              <Card.Body>
                {isClient ? (
                  <>
                    <h4>Book This Service</h4>
                    {bookingError && (
                      <Alert variant="danger">{bookingError}</Alert>
                    )}
                    {bookingSuccess && (
                      <Alert variant="success">{bookingSuccess}</Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                      <Row className="g-3 mb-3">
                        <Col md={6}>
                          <Form.Label>Booking Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="bookingDate"
                            value={bookingForm.bookingDate}
                            onChange={handleChange}
                            required
                            disabled={bookingLoading}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label>Start Time</Form.Label>
                          <Form.Control
                            type="time"
                            name="startTime"
                            value={bookingForm.startTime}
                            onChange={handleChange}
                            required
                            disabled={bookingLoading}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label>End Time</Form.Label>
                          <Form.Control
                            type="time"
                            name="endTime"
                            value={bookingForm.endTime}
                            onChange={handleChange}
                            required
                            disabled={bookingLoading}
                          />
                        </Col>
                      </Row>
                      <Row className="g-3 mb-3">
                        <Col md={6}>
                          <Form.Label>Duration (hours)</Form.Label>
                          <Form.Control
                            type="number"
                            name="duration"
                            value={bookingForm.duration}
                            onChange={handleChange}
                            required
                            disabled={bookingLoading}
                            min="1"
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label>Total Estimated Cost</Form.Label>
                          <Form.Control
                            type="number"
                            value={Number(bookingForm.duration) * service.price_per_hour}
                            readOnly
                            className="bg-light"
                          />
                        </Col>
                      </Row>
                      <Row className="g-3 mb-3">
                        <Col md={12}>
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={bookingForm.address}
                            onChange={handleChange}
                            required
                            disabled={bookingLoading}
                            placeholder="Enter the address where service is needed"
                          />
                        </Col>
                      </Row>
                      <Row className="g-3 mb-3">
                        <Col md={4}>
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={bookingForm.city}
                            onChange={handleChange}
                            required
                            disabled={bookingLoading}
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label>State</Form.Label>
                          <Form.Control
                            type="text"
                            name="state"
                            value={bookingForm.state}
                            onChange={handleChange}
                            required
                            disabled={bookingLoading}
                            maxLength={2}
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label>ZIP Code</Form.Label>
                          <Form.Control
                            type="text"
                            name="zipCode"
                            value={bookingForm.zipCode}
                            onChange={handleChange}
                            required
                            disabled={bookingLoading}
                            maxLength={5}
                          />
                        </Col>
                      </Row>
                      <Row className="g-3 mb-3">
                        <Col md={12}>
                          <Form.Label>Special Instructions (optional)</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="specialInstructions"
                            value={bookingForm.specialInstructions}
                            onChange={handleChange}
                            disabled={bookingLoading}
                            placeholder="Any specific instructions for the provider"
                          />
                        </Col>
                      </Row>
                      <Button variant="primary" type="submit" className="w-100" disabled={bookingLoading}>
                        {bookingLoading ? 'Processing...' : 'Book Now'}
                      </Button>
                    </Form>
                  </>
                ) : (
                  <div className="text-center py-4">
                    {!user ? (
                      <p>Please <Link to="/login" className="text-decoration-none">log in</Link> to book this service.</p>
                    ) : (
                      <p>Only clients can book services. Your account is registered as a {user.role}.</p>
                    )}
                  </div>
                )}
              </Card.Body>
            )}
            {isOwner && (
              <Card.Body className="text-center">
                <Link to={`/services/${service.id}/edit`} className="btn btn-outline-primary me-2">
                  Edit Service
                </Link>
                <Button variant="btn-outline-danger" onClick={() => {
                  if (window.confirm('Are you sure you want to delete this service?')) {
                    // TODO: Implement delete functionality
                    alert('Delete functionality not implemented yet');
                  }
                }}>
                  Delete Service
                </Button>
              </Card.Body>
            )}
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Service Overview</Card.Title>
              <ListGroup className="list-group-flush">
                <ListGroup.Item>
                  <strong>Service ID:</strong> {service.id}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Category:</strong> {service.category}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Availability:</strong> {service.availability?.length > 0 ? service.availability.map(a => `${a.day}: ${a.startTime} - ${a.endTime}`).join(', ') : 'Not specified'}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Provider Since:</strong> {new Date(service.provider.createdAt).toLocaleDateString()}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ServiceDetail;