import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Link } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { FaCalendarAlt, FaUserInjured, FaUserNurse, FaClock, FaMoneyBill, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not a client
  useEffect(() => {
    if (!user || user.role !== 'client') {
      window.location.href = '/';
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingAPI.getBookings({ role: 'client' });
      setBookings(response);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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
          <h2>Client Dashboard</h2>
          <p className="text-muted">Welcome back, {user.name}! Here are your recent bookings.</p>
        </Col>
      </Row>

      {bookings.length === 0 ? (
        <Row className="mb-4">
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <FaCalendarAlt size={48} className="mb-3 text-muted" />
                <h5>No bookings yet</h5>
                <p className="text-muted">
                  You haven't made any bookings yet. Start by browsing our services.
                </p>
                <Button variant="primary" as={Link} to="/services">
                  Browse Services
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <Table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Service</th>
                    <th>Provider</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.service.title}</strong>
                        <br />
                        <small className="text-muted">{booking.service.category}</small>
                      </td>
                      <td>
                        <strong>{booking.provider.name}</strong>
                        <br />
                        <small className="text-muted">{booking.provider.role}</small>
                      </td>
                      <td>{formatDate(booking.booking_date)}</td>
                      <td>
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td>${booking.total_amount.toFixed(2)}</td>
                      <td>
                        {getActionButtons(booking)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      )}
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

// Helper function to get action buttons
const getActionButtons = (booking) => {
  // Only show cancel button for pending bookings
  if (booking.status === 'pending') {
    return (
      <Button variant="outline-danger" size="sm" onClick={() => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
          // TODO: Implement cancel booking API call
          alert('Cancel booking functionality not implemented yet');
        }
      }}>
        Cancel
      </Button>
    );
  }

  // Show rebook button for completed bookings
  if (booking.status === 'completed') {
    return (
      <Button variant="outline-primary" size="sm" as={Link} to={`/services/${booking.service.id}`}>
        Rebook
      </Button>
    );
  }

  // For confirmed bookings, show details
  return (
    <Button variant="outline-secondary" size="sm" as={Link} to={`/services/${booking.service.id}`}>
      Details
    </Button>
  );
};

export default ClientDashboard;