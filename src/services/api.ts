const API_BASE = '/api';

export const api = {
  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  },

  // ─── Token Refresh & Auth-Aware Fetch ────────────────────────────────────

  /**
   * Tries to silently refresh the access token using the HttpOnly refresh cookie.
   * Returns `true` on success, `false` if refresh is expired/invalid.
   */
  async tryRefresh(): Promise<boolean> {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return response.ok;
  },

  /**
   * A wrapper around `fetch` that automatically retries once after a token
   * refresh on 401/403. If the refresh also fails, it logs the user out and
   * redirects to the login page.
   */
  async authFetch(url: string, options: RequestInit = {}, retry = true): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: { ...this.getHeaders(), ...(options.headers as Record<string, string> || {}) },
      credentials: 'include',
    });

    if ((response.status === 401 || response.status === 403) && retry) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        // Retry original request with new token
        return this.authFetch(url, options, false);
      }
      // Refresh failed — force logout
      window.location.href = '/login';
    }

    return response;
  },

  // ─── Auth ─────────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(data: any) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.error || 'Registration failed');
    return resData;
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.authFetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  },

  // ─── User Profile ─────────────────────────────────────────────────────────

  async getMe() {
    const response = await this.authFetch(`${API_BASE}/me`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch user');
    return data;
  },

  async updateMe(data: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
    phone?: string;
    location?: string;
    about_me?: string;
  }) {
    const response = await this.authFetch(`${API_BASE}/me`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.error || 'Failed to update user');
    return resData;
  },

  // ─── Services ─────────────────────────────────────────────────────────────

  async getServices() {
    const response = await fetch(`${API_BASE}/services`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch services');
    return data;
  },

  async getMyServices() {
    const response = await this.authFetch(`${API_BASE}/me/services`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch user services');
    return data;
  },

  async updateMyServices(services: string[]) {
    const response = await this.authFetch(`${API_BASE}/me/services`, {
      method: 'POST',
      body: JSON.stringify({ services }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update user services');
    return data;
  },

  // ─── Jobs ─────────────────────────────────────────────────────────────────

  async getJobs(filters?: { status?: string; view?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.view)   params.set('view',   filters.view);
    const url = `${API_BASE}/jobs${params.toString() ? `?${params}` : ''}`;
    const response = await this.authFetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch jobs');
    return data;
  },

  async getJobsByView(view: 'history' | 'ongoing' | 'assigned') {
    const response = await this.authFetch(`${API_BASE}/jobs?view=${view}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch jobs');
    return data;
  },

  async createJob(data: {
    title: string;
    description: string;
    location: string;
    budget: number;
    is_negotiable: boolean;
    payment_method: string;
  }) {
    const response = await this.authFetch(`${API_BASE}/jobs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.error || 'Failed to create job');
    return resData;
  },

  async getJob(id: number) {
    const response = await this.authFetch(`${API_BASE}/jobs/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch job');
    return data;
  },

  async deleteJob(id: number) {
    const response = await this.authFetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete job');
    return data;
  },

  async updateJobStatus(id: number, status: 'in_progress' | 'completed' | 'cancelled') {
    const response = await this.authFetch(`${API_BASE}/jobs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update job status');
    return data;
  },

  // ─── Applications ──────────────────────────────────────────────────────────

  async applyToJob(jobId: number, message?: string) {
    const response = await this.authFetch(`${API_BASE}/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message: message ?? '' }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to apply to job');
    return data;
  },

  async getJobApplications(jobId: number) {
    const response = await this.authFetch(`${API_BASE}/jobs/${jobId}/applications`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch applications');
    return data;
  },

  async decideApplication(applicationId: number, status: 'accepted' | 'rejected') {
    const response = await this.authFetch(`${API_BASE}/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update application');
    return data;
  },

  async getMyApplications() {
    const response = await this.authFetch(`${API_BASE}/me/applications`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch your applications');
    return data;
  },

  // ─── Provider Directory ────────────────────────────────────────────────────

  async getProviders(filters?: { service?: string; location?: string; q?: string }) {
    const params = new URLSearchParams();
    if (filters?.service)  params.set('service',  filters.service);
    if (filters?.location) params.set('location', filters.location);
    if (filters?.q)        params.set('q',        filters.q);

    const url = `${API_BASE}/providers${params.toString() ? `?${params}` : ''}`;
    const response = await this.authFetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch providers');
    return data;
  },

  async getProvider(id: number) {
    const response = await this.authFetch(`${API_BASE}/providers/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch provider');
    return data;
  },

  // ─── Messaging ─────────────────────────────────────────────────────────────

  async getConversations() {
    const response = await this.authFetch(`${API_BASE}/messages/conversations`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch conversations');
    return data;
  },

  async getMessages(userId: number) {
    const response = await this.authFetch(`${API_BASE}/messages/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch messages');
    return data;
  },

  async sendMessage(receiverId: number, content: string, jobId?: number) {
    const response = await this.authFetch(`${API_BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content, job_id: jobId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  async markMessagesRead(userId: number) {
    const response = await this.authFetch(`${API_BASE}/messages/read/${userId}`, { method: 'PUT' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to mark messages as read');
    return data;
  },

  // ─── Notifications ─────────────────────────────────────────────────────────

  async getNotifications() {
    const response = await this.authFetch(`${API_BASE}/notifications`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch notifications');
    return data; // { notifications: [], unread_count: number }
  },

  async markNotificationRead(id: number) {
    const response = await this.authFetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to mark notification');
    return data;
  },

  async markAllNotificationsRead() {
    const response = await this.authFetch(`${API_BASE}/notifications/read-all`, { method: 'PUT' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to mark all notifications');
    return data;
  },

  // ─── Reviews ───────────────────────────────────────────────────────────────

  async createReview(jobId: number, rating: number, comment?: string) {
    const response = await this.authFetch(`${API_BASE}/jobs/${jobId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to submit review');
    return data;
  },

  async getUserReviews(userId: number) {
    const response = await this.authFetch(`${API_BASE}/users/${userId}/reviews`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch reviews');
    return data; // { reviews: [], avg_rating: number, total_reviews: number }
  },
};

