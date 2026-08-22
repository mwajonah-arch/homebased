import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceAPI } from '../services/api';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    city: '',
    state: '',
    zipCode: '',
    pricePerHour: '',
    duration: '',
    availability: '',
    images: ''
  });

  // Redirect if not a provider
  useEffect(() => {
    if (!user || !(user.role === 'nurse' || user.role === 'caregiver')) {
      window.location.href = '/';
    }
  }, [user]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await serviceAPI.getServices({}); // Get all services for this provider
      // Filter services to only show those belonging to the current user
      const providerServices = response.filter(service => service.provider.id === user.id);
      setServices(providerServices);
    } catch (err) {
      setError('Failed to fetch services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await serviceAPI.getBookings({ role: 'provider' }, user.id);
      setBookings(response);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  }, [user]);

  // Fetch services and bookings when user changes
  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, [user, fetchServices, fetchBookings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In a real implementation, we would call serviceAPI.createService here
    // For now, we'll just show a success message and reset the form
    alert('Service added successfully! (Functionality to be implemented)');
    setShowAddServiceForm(false);
    setServiceForm({
      title: '',
      description: '',
      category: '',
      location: '',
      city: '',
      state: '',
      zipCode: '',
      pricePerHour: '',
      duration: '',
      availability: '',
      images: ''
    });
    // Refresh services list
    fetchServices();
  };

  const toggleAddServiceForm = () => {
    setShowAddServiceForm(!showAddServiceForm);
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

  if (error) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h2>Provider Dashboard</h2>
          <p className="text-muted">Welcome back, {user.name}! Manage your services and bookings.</p>
        </Col>
      </Row>

      {/* Tabs for Services and Bookings */}
      <Row className="mb-4">
        <Col>
          <Button variant="outline-primary" onClick={toggleAddServiceForm} className="me-2">
            {showAddServiceForm ? 'Cancel' : '+ Add New Service'}
          </Button>
          <Link to="/provider/services" className="btn btn-outline-secondary me-2">
            Manage Services
          </Link>
          <Link to="/provider/bookings" className="btn btn-outline-secondary">
            Manage Bookings
          </Link>
        </Col>
      </Row>

      {/* Add Service Form */}
      {showAddServiceForm && (
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Header>
                <h3>Add New Service</h3>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="title">
                    <Form.Label>Service Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter service title"
                      name="title"
                      value={serviceForm.title}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter service description"
                      name="description"
                      value={serviceForm.description}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="category">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={serviceForm.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="nursing">Nursing</option>
                      <option value="caregiving">Caregiving</option>
                      <option value="physical therapy">Physical Therapy</option>
                      <option value="occupational therapy">Occupational Therapy</option>
                      <option value="companionship">Companionship</option>
                      <option value="meal preparation">Meal Preparation</option>
                      <option value="medication management">Medication Management</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Row className="mb-3">
                    <Form.Group className="me-3" controlId="city">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter city"
                        name="city"
                        value={serviceForm.city}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="me-3" controlId="state">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter state (e.g., CA)"
                        name="state"
                        value={serviceForm.state}
                        onChange={handleChange}
                        maxLength={2}
                      />
                    </Form.Group>
                  </Form.Row>

                  <Form.Row className="mb-3">
                    <Form.Group className="me-3" controlId="pricePerHour">
                      <Form.Label>Price Per Hour ($)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter hourly rate"
                        name="pricePerHour"
                        value={serviceForm.pricePerHour}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>

                    <Form.Group className="me-3" controlId="duration">
                      <Form.Label>Duration (hours)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter default duration"
                        name="duration"
                        value={serviceForm.duration}
                        onChange={handleChange}
                        min="1"
                      />
                    </Form.Group>
                  </Form.Row>

                  <Button variant="primary" type="submit" className="w-100">
                    Add Service
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Services List */}
      <Row className="mb-4">
        <Col>
          <h3>My Services ({services.length})</h3>
          {services.length === 0 ? (
            <div className="alert alert-info">
              You haven't added any services yet. Click "Add New Service" to get started.
            </div>
          ) : (
            <Table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price/Hour</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>{service.title}</td>
                    <td>{service.category}</td>
                    <td>${service.price_per_hour}</td>
                    <td>
                      <span className={`badge bg-${service.is_active ? 'success' : 'secondary'}`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to={`/provider/services/edit/${service.id}`} className="btn btn-outline-sm btn-outline-primary">
                          <FaEdit /> Edit
                        </Link>
                        <Button variant="btn-outline-sm btn-outline-danger" onClick={() => {
                          if (window.confirm('Are you sure you want to delete this service?')) {
                            // TODO: Implement delete functionality
                            alert('Delete functionality not implemented yet');
                          }
                        }}>
                          <FaTrashAlt /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* Recent Bookings */}
      <Row>
        <Col>
          <h3>Recent Bookings</h3>
          {bookings.length === 0 ? (
            <div className="alert alert-info">
              No bookings yet.
            </div>
          ) : (
            <Table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.client.name}</td>
                    <td>{booking.service.title}</td>
                    <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge bg-${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
};

export default ProviderDashboard;