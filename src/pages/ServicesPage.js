import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaUserNurse, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { serviceAPI } from '../services/api';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    state: '',
    minRate: '',
    maxRate: ''
  });

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const servicesData = await serviceAPI.getServices(filters);
      setServices(servicesData);
    } catch (err) {
      setError('Failed to fetch services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      city: '',
      state: '',
      minRate: '',
      maxRate: ''
    });
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

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h2>Find Nursing & Caregiving Services</h2>
          <p className="text-muted">
            Search for qualified nurses and caregivers in your area.
          </p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col md={8}>
          <Form>
            <Row className="g-3">
              <Col>
                <Form.Label>Search by keyword</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Enter service type or provider name"
                    aria-label="Search"
                  />
                  <InputGroup.Text id="basic-addon2"><FaSearch /></InputGroup.Text>
                </InputGroup>
              </Col>
              <Col>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  aria-label="Category"
                >
                  <option value="">All Categories</option>
                  <option value="nursing">Nursing</option>
                  <option value="caregiving">Caregiving</option>
                  <option value="physical therapy">Physical Therapy</option>
                  <option value="occupational therapy">Occupational Therapy</option>
                  <option value="companionship">Companionship</option>
                  <option value="meal preparation">Meal Preparation</option>
                  <option value="medication management">Medication Management</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter city"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                />
              </Col>
              <Col>
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter state"
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  maxLength={2}
                />
              </Col>
              <Col>
                <Form.Label>Min Rate ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Min"
                  name="minRate"
                  value={filters.minRate}
                  onChange={handleFilterChange}
                />
              </Col>
              <Col>
                <Form.Label>Max Rate ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Max"
                  name="maxRate"
                  value={filters.maxRate}
                  onChange={handleFilterChange}
                />
              </Col>
              <Col className="d-flex align-items-end">
                <Button variant="outline-primary" onClick={handleFilterChange} disabled={loading}>
                  Search
                </Button>
                <Button variant="outline-secondary" onClick={handleResetFilters} className="ms-2">
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      <Row>
        {services.length === 0 ? (
          <Col>
            <div className="alert alert-info">
              No services found. Try adjusting your search criteria.
            </div>
          </Col>
        ) : (
          services.map((service) => (
            <Col key={service.id} md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img variant="top" src={service.images && service.images[0] ? service.images[0] : '/placeholder-image.jpg'} alt={service.title} />
                <Card.Body>
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text className="text-muted">
                    <FaMapMarkerAlt /> {service.city}, {service.state}
                  </Card.Text>
                  <p className="card-text service-description">
                    {service.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <FaUserNurse /> {service.provider.name}
                    </div>
                    <div>
                      <FaCalendarAlt /> ${service.price_per_hour}/hr
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <Button variant="outline-primary" size="sm" as={Link} to={`/services/${service.id}`}>
                      Details
                    </Button>
                    {(!service.provider.isAvailable || !service.is_active) ? (
                      <Button variant="outline-secondary" size="sm" disabled>
                        Not Available
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" as={Link} to={`/services/${service.id}`}>
                        Book Now
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default ServicesPage;