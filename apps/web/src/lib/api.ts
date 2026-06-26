const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('coxbeach_token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data as T;
  }

  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body: unknown) { return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) }); }
  patch<T>(path: string, body: unknown) { return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete<T>(path: string) { return this.request<T>(path, { method: 'DELETE' }); }
}

export const api = new ApiClient();

// Auth helpers
export const authApi = {
  sendOtp: (phone: string) => api.post('/api/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string) => api.post<{ token: string; user: User }>('/api/auth/verify-otp', { phone, otp }),
  login: (phone: string, password: string) => api.post<{ token: string; user: User }>('/api/auth/login', { phone, password }),
  register: (data: { phone: string; name: string; email?: string; password?: string }) => api.post<{ token: string; user: User }>('/api/auth/register', data),
  me: () => api.get<User>('/api/auth/me'),
  updateProfile: (data: { name?: string; email?: string }) => api.patch<User>('/api/auth/me', data),
};

// Hotel helpers
export const hotelApi = {
  list: () => api.get<Hotel[]>('/api/hotels'),
  get: (id: string) => api.get<Hotel>(`/api/hotels/${id}`),
  create: (data: Partial<Hotel>) => api.post<Hotel>('/api/hotels', data),
  update: (id: string, data: Partial<Hotel>) => api.patch<Hotel>(`/api/hotels/${id}`, data),
  approve: (id: string) => api.post(`/api/hotels/${id}/approve`, {}),
  rooms: (hotelId: string) => api.get<Room[]>(`/api/hotels/${hotelId}/rooms`),
  addRoom: (hotelId: string, data: Partial<Room>) => api.post<Room>(`/api/hotels/${hotelId}/rooms`, data),
};

// Search
export const searchApi = {
  search: (params: SearchParams) => {
    const qs = new URLSearchParams(params as unknown as Record<string, string>).toString();
    return api.get<SearchResult>(`/api/search?${qs}`);
  },
};

// Bookings
export const bookingApi = {
  hold: (data: HoldRequest) => api.post<{ booking: Booking; pricing: Pricing; holdExpiresAt: string }>('/api/bookings/hold', data),
  my: () => api.get<Booking[]>('/api/bookings/my'),
  hotel: () => api.get<Booking[]>('/api/bookings/hotel'),
  get: (id: string) => api.get<Booking>(`/api/bookings/${id}`),
  cancel: (id: string, reason?: string) => api.post(`/api/bookings/${id}/cancel`, { reason }),
};

// Payments
export const paymentApi = {
  initiate: (bookingId: string, gateway: string) => api.post<PaymentResponse>('/api/payments/initiate', { bookingId, gateway }),
  confirmSandbox: (gateway: string, bookingId: string, txnId: string) => {
    const payloadKey = gateway === 'SSLCOMMERZ' ? 'val_id' : 'txnId';
    return api.post(`/api/payments/webhook/${gateway.toLowerCase()}`, { bookingId, [payloadKey]: txnId });
  },
};

// Rooms
export const roomApi = {
  update: (roomId: string, data: Partial<Room>) => api.patch<Room>(`/api/rooms/${roomId}`, data),
  delete: (roomId: string) => api.delete<{ success: boolean }>(`/api/rooms/${roomId}`),
};

// Pricing
export const pricingApi = {
  quote: (basePricePerNight: number, nights: number, hasAgent = false) =>
    api.get<Pricing>(`/api/pricing/quote?basePricePerNight=${basePricePerNight}&nights=${nights}&hasAgent=${hasAgent}`),
};

// Reviews
export const reviewApi = {
  create: (data: { bookingId: string; rating: number; title?: string; body: string }) => api.post('/api/reviews', data),
  hotel: (hotelId: string) => api.get<{ reviews: Review[]; avgRating: number; count: number }>(`/api/reviews/hotel/${hotelId}`),
  myHotelReviews: () => api.get<AdminReview[]>('/api/reviews/hotel'),
};

// Agent
export const agentApi = {
  register: (nid: string) => api.post('/api/agents/register', { nid }),
  myProfile: () => api.get('/api/agents/my'),
  myEarnings: () => api.get('/api/agents/my/earnings'),
  createAttribution: (agentCode: string) => api.post<{ sessionId: string }>('/api/agents/attribute', { agentCode }),
};

// Admin
export const adminApi = {
  kpis: () => api.get<KPIs>('/api/admin/kpis'),
  config: () => api.get<PlatformConfig[]>('/api/admin/config'),
  updateConfig: (key: string, value: string) => api.patch(`/api/admin/config/${key}`, { value }),
  users: () => api.get<AdminUser[]>('/api/admin/users'),
  updateUser: (id: string, data: { status: string }) => api.patch(`/api/admin/users/${id}`, data),
  bookings: () => api.get<AdminBooking[]>('/api/admin/bookings'),
  agents: () => api.get<AdminAgent[]>('/api/admin/agents'),
  settlements: () => api.get<{ agents: AgentSettlement[]; hotels: HotelSettlement[] }>('/api/admin/settlements'),
  ledger: () => api.get<LedgerEntry[]>('/api/admin/ledger'),
  pendingReviews: () => api.get<AdminReview[]>('/api/reviews/pending'),
  approveReview: (id: string) => api.patch(`/api/reviews/${id}/approve`, {}),
  rejectReview: (id: string) => api.patch(`/api/reviews/${id}/reject`, {}),
  hotels: (status?: string) => api.get<Hotel[]>(`/api/admin/hotels${status ? `?status=${status}` : ''}`),
  pendingHotels: () => api.get<Hotel[]>('/api/admin/hotels?status=PENDING_APPROVAL'),
  approveHotel: (id: string) => api.post(`/api/hotels/${id}/approve`, {}),
  rejectHotel: (id: string) => api.post(`/api/hotels/${id}/reject`, {}),
  cms: () => api.get<CmsPage[]>('/api/admin/cms'),
  updateCms: (key: string, data: { content?: string; title?: string }) => api.patch<CmsPage>(`/api/admin/cms/${key}`, data),
};

// Types
export interface User { id: string; phone: string; name: string; email?: string; role: string; }
export interface Hotel {
  id: string; name: string; slug: string; description: string; address: string; city: string;
  starRating: string; amenities: string[]; photos: string[]; status: string;
  checkInTime: string; checkOutTime: string; avgRating?: number;
  _count?: { reviews: number; rooms: number };
  rooms?: Room[];
  reviews?: Review[];
}
export interface Room {
  id: string; hotelId: string; name: string; type: string; description?: string;
  basePriceBdt: number; maxGuests: number; totalUnits: number; photos: string[]; amenities: string[];
  isActive?: boolean; hotel?: Hotel;
  discountType?: 'NONE' | 'PERCENTAGE' | 'AMOUNT';
  discountValue?: number;
  discountLabel?: string;
}
export interface HoldRequest {
  roomId: string; checkIn: string; checkOut: string; guestCount?: number; attributionSessionId?: string;
}
export interface Booking {
  id: string; bookingRef: string; userId: string; hotelId: string; status: string;
  checkIn: string; checkOut: string; nights: number; guestCount: number;
  guestName: string; guestPhone: string; guestEmail?: string;
  baseTotalBdt: number; platformFeeBdt: number; agentCommBdt: number; vatBdt: number; grandTotalBdt: number;
  hotel?: Hotel; items?: BookingItem[]; payments?: Payment[];
  holdExpiresAt?: string; review?: Review | null;
}
export interface BookingItem { id: string; roomId: string; nights: number; pricePerNightBdt: number; subtotalBdt: number; room?: Room; }
export interface Payment { id: string; gateway: string; status: string; amountBdt: number; }
export interface Pricing {
  baseTotalBdt: number; platformFeeBdt: number; agentCommBdt: number; vatBdt: number; grandTotalBdt: number;
  nights: number; pricePerNight: number;
  rates: { vatRate: number; platformFeeRate: number; agentCommRate: number };
}
export interface PaymentResponse { paymentId: string; gateway: string; amountBdt: number; redirectUrl: string; instructions: string; sandboxInstructions: { ref: string } }
export interface Review { id: string; rating: number; title?: string; body: string; user?: { name: string }; createdAt: string; }
export interface SearchParams { checkIn: string; checkOut: string; guests?: number; city?: string; minPrice?: number; maxPrice?: number; sortBy?: string; }
export interface SearchResult { results: (Room & { pricePerNight: number; totalPrice: number; nights: number; hotel: Hotel })[]; nights: number; }
export interface KPIs { totalHotels: number; totalBookings: number; confirmedBookings: number; totalRevenueBdt: number; totalUsers: number; totalAgents: number; pendingReviews: number; pendingHotels: number; }
export interface PlatformConfig { key: string; value: string; description?: string; }
export interface AdminUser { id: string; name: string; phone: string; email?: string; role: string; status: string; createdAt: string; }
export interface AdminBooking { id: string; bookingRef: string; status: string; checkIn: string; checkOut: string; nights: number; guestName: string; grandTotalBdt: number; user?: { name: string }; hotel?: { name: string }; createdAt: string; }
export interface AdminReview { id: string; rating: number; title?: string; body: string; status: string; user?: { name: string }; hotel?: { name: string }; createdAt: string; }
export interface AdminAgent { id: string; agentCode: string; name: string; phone: string; nidLast4: string; totalBookings: number; totalCommissionBdt: number; pendingCommissionBdt: number; status: string; joinedAt: string; }
export interface AgentSettlement { id: string; agentName: string; agentCode: string; period: string; totalBookings: number; commissionBdt: number; status: string; createdAt: string; }
export interface HotelSettlement { id: string; hotelName: string; period: string; totalBookings: number; netRevenueBdt: number; status: string; createdAt: string; }
export interface LedgerEntry { id: string; bookingRef: string; type: 'DEBIT' | 'CREDIT'; account: string; amountBdt: number; description: string; createdAt: string; }
export interface CmsPage { key: string; title: string; content: string; updatedAt: string; }
