const API_BASE = '/api';

export const api = {
  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  },

  async safeJson(response: Response, errorMessage: string) {
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(text || errorMessage);
    }
    
    if (!response.ok) {
      throw new Error(data?.error || data?.message || text || errorMessage);
    }
    return data;
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
  async authFetch(url: string, options: RequestInit & { skipRedirect?: boolean } = {}, retry = true): Promise<Response> {
    const { skipRedirect, ...fetchOptions } = options;
    const response = await fetch(url, {
      ...fetchOptions,
      headers: { ...this.getHeaders(), ...(fetchOptions.headers as Record<string, string> || {}) },
      credentials: 'include',
    });

    if ((response.status === 401 || response.status === 403) && retry) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        // Retry original request with new token
        return this.authFetch(url, options, false);
      }
      // Refresh failed — force logout if not already on login/signup
      if (!skipRedirect && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
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
    return this.safeJson(response, 'Login failed');
  },

  async register(data: any) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return this.safeJson(response, 'Registration failed');
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
    return this.safeJson(response, 'Failed to change password');
  },
  
  async sendOTP() {
    const response = await this.authFetch(`${API_BASE}/auth/send-otp`, { method: 'POST' });
    return this.safeJson(response, 'Failed to send OTP');
  },

  async verifyOTP(otp: string) {
    const response = await this.authFetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
    return this.safeJson(response, 'Failed to verify OTP');
  },

  // ─── User Profile ─────────────────────────────────────────────────────────

  async getMe() {
    const response = await this.authFetch(`${API_BASE}/me`, { skipRedirect: true });
    return this.safeJson(response, 'Failed to fetch user');
  },

  async updateMe(data: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
    phone?: string;
    location?: string;
    about_me?: string;
    service_radius?: number;
    pref_email_messages?: number;
    pref_email_updates?: number;
    pref_email_promos?: number;
    pref_push_alerts?: number;
    pref_push_marketing?: number;
    is_public_profile?: number;
    show_online_status?: number;
  }) {
    const response = await this.authFetch(`${API_BASE}/me`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.safeJson(response, 'Failed to update user');
  },

  async deleteMe() {
    const response = await this.authFetch(`${API_BASE}/me`, {
      method: 'DELETE',
    });
    return this.safeJson(response, 'Failed to delete account');
  },

  async getBillingHistory() {
    const response = await this.authFetch(`${API_BASE}/me/billing`);
    return this.safeJson(response, 'Failed to fetch billing history');
  },

  async getAddresses() {
    const response = await this.authFetch(`${API_BASE}/me/addresses`);
    return this.safeJson(response, 'Failed to fetch addresses');
  },

  async addAddress(data: { label: string; address_text: string; is_default?: number }) {
    const response = await this.authFetch(`${API_BASE}/me/addresses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.safeJson(response, 'Failed to add address');
  },

  async deleteAddress(id: number) {
    const response = await this.authFetch(`${API_BASE}/me/addresses/${id}`, {
      method: 'DELETE',
    });
    return this.safeJson(response, 'Failed to delete address');
  },

  async setDefaultAddress(id: number) {
    const response = await this.authFetch(`${API_BASE}/me/addresses/${id}/default`, {
      method: 'PATCH',
    });
    return this.safeJson(response, 'Failed to set default address');
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await fetch(`${API_BASE}/me/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return this.safeJson(response, 'Upload failed');
  },

  async uploadDocuments(file: File) {
    const formData = new FormData();
    formData.append('document', file);
    const response = await fetch(`${API_BASE}/me/documents`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return this.safeJson(response, 'Document upload failed');
  },

  // ─── Services ─────────────────────────────────────────────────────────────

  async getServices() {
    const response = await fetch(`${API_BASE}/services`, { credentials: 'include' });
    return this.safeJson(response, 'Failed to fetch services');
  },

  async getMyServices() {
    const response = await this.authFetch(`${API_BASE}/me/services`);
    return this.safeJson(response, 'Failed to fetch user services');
  },

  async updateMyServices(services: string[]) {
    const response = await this.authFetch(`${API_BASE}/me/services`, {
      method: 'POST',
      body: JSON.stringify({ services }),
    });
    return this.safeJson(response, 'Failed to update user services');
  },

  // ─── Jobs ─────────────────────────────────────────────────────────────────

  async getJobs(filters?: { status?: string; view?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.view)   params.set('view',   filters.view);
    const url = `${API_BASE}/jobs${params.toString() ? `?${params}` : ''}`;
    const response = await this.authFetch(url);
    return this.safeJson(response, 'Failed to fetch jobs');
  },

  async getJobsByView(view: 'history' | 'ongoing' | 'assigned') {
    const response = await this.authFetch(`${API_BASE}/jobs?view=${view}`);
    return this.safeJson(response, 'Failed to fetch jobs');
  },

  async createJob(data: {
    title: string;
    description: string;
    location: string;
    budget: number;
    is_negotiable: boolean;
    payment_method: string;
    provider_id?: number;
  }) {
    const response = await this.authFetch(`${API_BASE}/jobs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.safeJson(response, 'Failed to create job');
  },

  async getJob(id: number) {
    const response = await this.authFetch(`${API_BASE}/jobs/${id}`);
    return this.safeJson(response, 'Failed to fetch job');
  },

  async deleteJob(id: number) {
    const response = await this.authFetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' });
    return this.safeJson(response, 'Failed to delete job');
  },

  async updateJobStatus(id: number, status: 'in_progress' | 'completed' | 'cancelled') {
    const response = await this.authFetch(`${API_BASE}/jobs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return this.safeJson(response, 'Failed to update job status');
  },

  // ─── Applications ──────────────────────────────────────────────────────────

  async applyToJob(jobId: number, message?: string) {
    const response = await this.authFetch(`${API_BASE}/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message: message ?? '' }),
    });
    return this.safeJson(response, 'Failed to apply to job');
  },

  async getJobApplications(jobId: number) {
    const response = await this.authFetch(`${API_BASE}/jobs/${jobId}/applications`);
    return this.safeJson(response, 'Failed to fetch applications');
  },

  async decideApplication(applicationId: number, status: 'accepted' | 'rejected', paymentMethod?: string) {
    const response = await this.authFetch(`${API_BASE}/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, payment_method: paymentMethod }),
    });
    return this.safeJson(response, 'Failed to update application');
  },

  async deleteApplication(applicationId: number) {
    const response = await this.authFetch(`${API_BASE}/applications/${applicationId}`, {
      method: 'DELETE',
    });
    return this.safeJson(response, 'Failed to delete application');
  },

  async getMyApplications() {
    const response = await this.authFetch(`${API_BASE}/me/applications`);
    return this.safeJson(response, 'Failed to fetch your applications');
  },

  // ─── Provider Directory ────────────────────────────────────────────────────

  async getProviders(filters?: { service?: string; location?: string; q?: string }) {
    const params = new URLSearchParams();
    if (filters?.service)  params.set('service',  filters.service);
    if (filters?.location) params.set('location', filters.location);
    if (filters?.q)        params.set('q',        filters.q);

    const url = `${API_BASE}/providers${params.toString() ? `?${params}` : ''}`;
    const response = await this.authFetch(url);
    return this.safeJson(response, 'Failed to fetch providers');
  },

  async getProvider(id: number) {
    const response = await this.authFetch(`${API_BASE}/providers/${id}`);
    return this.safeJson(response, 'Failed to fetch provider');
  },

  // ─── Messaging ─────────────────────────────────────────────────────────────

  async getConversations() {
    const response = await this.authFetch(`${API_BASE}/messages/conversations`);
    return this.safeJson(response, 'Failed to fetch conversations');
  },

  async getMessages(userId: number) {
    const response = await this.authFetch(`${API_BASE}/messages/${userId}`);
    return this.safeJson(response, 'Failed to fetch messages');
  },

  async sendMessage(receiverId: number, content: string, jobId?: number) {
    const response = await this.authFetch(`${API_BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content, job_id: jobId }),
    });
    return this.safeJson(response, 'Failed to send message');
  },

  async markMessagesRead(userId: number) {
    const response = await this.authFetch(`${API_BASE}/messages/read/${userId}`, { method: 'PUT' });
    return this.safeJson(response, 'Failed to mark messages as read');
  },

  // ─── Notifications ─────────────────────────────────────────────────────────

  async getNotifications() {
    const response = await this.authFetch(`${API_BASE}/notifications`);
    return this.safeJson(response, 'Failed to fetch notifications');
  },

  async markNotificationRead(id: number) {
    const response = await this.authFetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    return this.safeJson(response, 'Failed to mark notification');
  },

  async markAllNotificationsRead() {
    const response = await this.authFetch(`${API_BASE}/notifications/read-all`, { method: 'PUT' });
    return this.safeJson(response, 'Failed to mark all notifications');
  },

  // ─── Reviews ───────────────────────────────────────────────────────────────

  async createReview(jobId: number, rating: number, comment?: string) {
    const response = await this.authFetch(`${API_BASE}/jobs/${jobId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
    return this.safeJson(response, 'Failed to submit review');
  },

  async getUserReviews(userId: number) {
    const response = await this.authFetch(`${API_BASE}/users/${userId}/reviews`);
    return this.safeJson(response, 'Failed to fetch reviews');
  },

  // ─── Support ───────────────────────────────────────────────────────────────

  async contactSupport(subject: string, message: string) {
    const response = await this.authFetch(`${API_BASE}/support/contact`, {
      method: 'POST',
      body: JSON.stringify({ subject, message }),
    });
    return this.safeJson(response, 'Failed to send support request');
  },

  async reportIssue(type: string, description: string) {
    const response = await this.authFetch(`${API_BASE}/support/report`, {
      method: 'POST',
      body: JSON.stringify({ type, description }),
    });
    return this.safeJson(response, 'Failed to submit report');
  },
};

