// Import the Supabase service
import { supabaseService } from './supabaseClient';

// Auth APIs
export const authAPI = {
  register: (userData) => {
    // Map userData to the format expected by supabaseService.signUp
    const { email, password, name, role, phone, address, city, state, zipCode } = userData;
    return supabaseService.signUp({
      email,
      password,
      name,
      role,
      phone,
      address,
      city,
      state,
      zipCode,
    }).then(res => {
      // res is { user, session }
      if (res && res.session) {
        return res.session.access_token;
      }
      throw new Error('No session returned from sign up');
    });
  },
  login: (credentials) => {
    const { email, password } = credentials;
    return supabaseService.signIn(email, password).then(res => {
      // res is { user, session }
      if (res && res.session) {
        return res.session.access_token;
      }
      throw new Error('No session returned from sign in');
    });
  },
  getProfile: () => {
    return supabaseService.getCurrentUser();
  }
};

// Service APIs
export const serviceAPI = {
  getServices: (params) => {
    // Convert params to filters for supabaseService.getServices
    const filters = {};
    if (params.category) filters.category = params.category;
    if (params.city) filters.city = params.city;
    if (params.state) filters.state = params.state;
    if (params.minRate) filters.minRate = params.minRate;
    if (params.maxRate) filters.maxRate = params.maxRate;
    // Note: supabaseService.getServices also supports other filters like availability, but we stick to the old API
    return supabaseService.getServices(filters);
  },
  getServiceById: (id) => {
    return supabaseService.getServiceById(id);
  },
  createService: (serviceData) => {
    // We need providerId. In the old API, the providerId would be from the current user.
    // We'll get the current user from supabaseService.getCurrentUser() and then use their id.
    // However, note that the old API might have expected the providerId to be in the serviceData or from context.
    // Since we are in the frontend, we can get the current user and then call the supabaseService.
    // But note: the supabaseService.createService requires providerId as a second argument.
    // We'll get the current user and then use their id.
    return supabaseService.getCurrentUser()
      .then((user) => {
        if (!user) throw new Error('User not authenticated');
        return supabaseService.createService(serviceData, user.id);
      });
  },
  updateService: (id, serviceData) => {
    return supabaseService.updateService(id, serviceData);
  },
  deleteService: (id) => {
    return supabaseService.deleteService(id);
  }
};

// Booking APIs
export const bookingAPI = {
  getBookings: (params) => {
    // We need to know the role and userId to filter bookings.
    // We'll get the current user and then determine the role.
    return supabaseService.getCurrentUser()
      .then((user) => {
        if (!user) throw new Error('User not authenticated');
        // Determine role from user (we assume the user object has a role field)
        const role = user.role || 'client'; // default to client if not set
        return supabaseService.getBookings(role, user.id);
      });
  },
  getBookingById: (id) => {
    return supabaseService.getBookingById(id);
  },
  createBooking: (bookingData) => {
    return supabaseService.createBooking(bookingData);
  },
  updateBookingStatus: (id, status) => {
    return supabaseService.updateBookingStatus(id, status);
  },
  cancelBooking: (id) => {
    return supabaseService.cancelBooking(id);
  }
};