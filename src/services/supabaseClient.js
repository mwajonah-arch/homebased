// Initialize Supabase client
import { createClient } from '@supabase/supabase-js'

// Get environment variables with defaults for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export helper functions for common operations
export const supabaseService = {
  // Auth helpers
  signUp: async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zip_code: userData.zipCode,
        },
      },
    })
    if (error) throw error
    return data
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  },

  updateUser: async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })
    if (error) throw error
    return data
  },

  // Service helpers
  getServices: async (filters = {}) => {
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:users(id, name, email, phone, profile_image_url, ratings, total_reviews, is_available)
      `)
      .eq('is_active', true)

    // Apply filters
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.city) query = query.eq('city', filters.city)
    if (filters.state) query = query.eq('state', filters.state)
    if (filters.minRate) query = query.gte('price_per_hour', filters.minRate)
    if (filters.maxRate) query = query.lte('price_per_hour', filters.maxRate)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  getServiceById: async (id) => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        provider:users(id, name, email, phone, profile_image_url, bio, experience, hourly_rate, ratings, total_reviews, specialties, is_available, created_at)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  createService: async (serviceData, providerId) => {
    const { data, error } = await supabase
      .from('services')
      .insert({
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        provider_id: providerId,
        location: serviceData.location,
        city: serviceData.city,
        state: serviceData.state,
        zip_code: serviceData.zipCode,
        price_per_hour: serviceData.pricePerHour,
        duration: serviceData.duration,
        availability: serviceData.availability || [],
        images: serviceData.images || [],
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateService: async (id, serviceData) => {
    const { data, error } = await supabase
      .from('services')
      .update({
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        location: serviceData.location,
        city: serviceData.city,
        state: serviceData.state,
        zip_code: serviceData.zipCode,
        price_per_hour: serviceData.pricePerHour,
        duration: serviceData.duration,
        availability: serviceData.availability || [],
        images: serviceData.images || [],
        is_active: serviceData.isActive,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  deleteService: async (id) => {
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) throw error
  },

  // Booking helpers
  getBookings: async (role, userId) => {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        client:users(id, name, email, phone),
        provider:users(id, name, email, phone, profile_image_url),
        service:services(id, title, description, category, price_per_hour)
      `)

    // Filter by role
    if (role === 'client') query = query.eq('client_id', userId)
    else if (role === 'provider') query = query.eq('provider_id', userId)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  getBookingById: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:users(id, name, email, phone),
        provider:users(id, name, email, phone, profile_image_url),
        service:services(id, title, description, category, price_per_hour)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  createBooking: async (bookingData) => {
    // First get the service to calculate total amount
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('price_per_hour, provider_id')
      .eq('id', bookingData.serviceId)
      .single()

    if (serviceError) throw serviceError

    const totalAmount = serviceData.price_per_hour * bookingData.duration

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        client_id: bookingData.clientId,
        provider_id: serviceData.provider_id,
        service_id: bookingData.serviceId,
        booking_date: bookingData.bookingDate,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        duration: bookingData.duration,
        total_amount: totalAmount,
        address: bookingData.address,
        city: bookingData.city,
        state: bookingData.state,
        zip_code: bookingData.zipCode,
        special_instructions: bookingData.specialInstructions || '',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateBookingStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  cancelBooking: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

export default supabaseService