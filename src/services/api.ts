import type {
  Customer,
  Offer,
  Campaign,
  CategoryTemplates,
  Settings,
  MediaAsset,
  ScheduleItem,
  AutomationWorkflow,
  MetaDataResponse,
  GoogleDataResponse,
  IntegrationStatusResponse,
  SuppressionRecord,
  GovernanceRules,
  InAppNotification
} from '../types';

export const API_BASE = (import.meta as any).env?.VITE_API_BASE || (import.meta as any).env?.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://sms-notification-backend.onrender.com'
);

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    let errMessage = `Request failed: ${res.statusText} (${res.status})`;
    try {
      const errObj = await res.json();
      if (errObj && (errObj.error || errObj.message)) {
        errMessage = errObj.error || errObj.message;
      }
    } catch {
      // Ignore json parse error
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // 1. Audience & Customer APIs
  async getCustomers(): Promise<Customer[]> {
    return fetchJson<Customer[]>('/api/customers');
  },
  async uploadCustomers(file: File): Promise<{ message: string; count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/upload/customers`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Customer upload failed');
    return res.json();
  },

  // 2. Offer APIs
  async getOffers(): Promise<Offer[]> {
    return fetchJson<Offer[]>('/api/offers');
  },
  async createOffer(payload: { code: string; discount: string; description?: string }): Promise<{ message: string }> {
    return fetchJson('/api/offers/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async uploadOffers(file: File): Promise<{ message: string; count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/upload/offers`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Offer upload failed');
    return res.json();
  },

  // 3. Templates Studio
  async getTemplate(): Promise<{ template: string }> {
    return fetchJson('/api/template');
  },
  async saveTemplate(template: string): Promise<{ message: string; template: string }> {
    return fetchJson('/api/template', {
      method: 'POST',
      body: JSON.stringify({ template })
    });
  },
  async getCategoryTemplates(): Promise<CategoryTemplates> {
    return fetchJson('/api/templates/list');
  },
  async getTemplateStats(): Promise<Array<{ category: string; count: number }>> {
    return fetchJson('/api/templates/stats');
  },
  async uploadTemplates(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/upload/templates`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Template upload failed');
    return res.json();
  },

  // 4. Settings & Care Gateway
  async getSettings(): Promise<Settings> {
    return fetchJson('/api/settings');
  },
  async saveSettings(settings: Partial<Settings>): Promise<{ message: string; settings: Settings }> {
    return fetchJson('/api/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  },
  async sendSingleMessage(payload: {
    recipient?: string;
    platform?: string;
    template?: string;
    recipientName?: string;
    offerCode?: string;
  }): Promise<{ success: boolean; message: string; details: any }> {
    return fetchJson('/api/sms/send-single', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async testCustomerCare(payload: {
    customerCareNumber?: string;
    template?: string;
    platform?: string;
  }): Promise<{ success: boolean; message: string; details: any }> {
    return fetchJson('/api/customer-care/test', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // 5. Campaign Dispatch
  async startCampaign(payload: {
    name?: string;
    scheduleDelayHours?: number;
    validUntil?: string;
    targetAudience?: string;
    customerCareNumber?: string;
    sendToCustomerCare?: boolean;
    platform?: string;
    template?: string;
  }): Promise<{ message: string; campaignId: number; platform: string }> {
    return fetchJson('/api/campaigns/start', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async getCampaign(id: number): Promise<Campaign> {
    return fetchJson(`/api/campaigns/${id}`);
  },
  async getCampaigns(): Promise<Campaign[]> {
    return fetchJson<Campaign[]>('/api/campaigns');
  },
  async getInboundMessages(): Promise<{ count: number; messages: any[] }> {
    return fetchJson<{ count: number; messages: any[] }>('/api/webhooks/twilio/messages');
  },

  // 6. Media Library
  async getMedia(query?: { type?: string; search?: string }): Promise<MediaAsset[]> {
    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    if (query?.search) params.append('search', query.search);
    return fetchJson(`/api/media?${params.toString()}`);
  },
  async uploadMedia(file: File, caption?: string, tags?: string): Promise<{ message: string; asset: MediaAsset }> {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    if (tags) formData.append('tags', tags);
    const res = await fetch(`${API_BASE}/api/media/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },
  async updateMedia(id: string, updates: { caption?: string; tags?: string[] }): Promise<{ message: string; asset: MediaAsset }> {
    return fetchJson(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  async deleteMedia(id: string, force = false): Promise<any> {
    const res = await fetch(`${API_BASE}/api/media/${id}?force=${force}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Delete failed' }));
      throw err;
    }
    return res.json();
  },

  // 7. Scheduler
  async getSchedules(): Promise<ScheduleItem[]> {
    return fetchJson('/api/schedules');
  },
  async createSchedule(payload: Partial<ScheduleItem>): Promise<{ message: string; schedule: ScheduleItem }> {
    return fetchJson('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async updateSchedule(id: string, updates: Partial<ScheduleItem>): Promise<{ message: string; schedule: ScheduleItem }> {
    return fetchJson(`/api/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  async deleteSchedule(id: string): Promise<{ message: string }> {
    return fetchJson(`/api/schedules/${id}`, {
      method: 'DELETE'
    });
  },
  async runScheduleNow(id: string): Promise<any> {
    return fetchJson(`/api/schedules/${id}/run-now`, {
      method: 'POST'
    });
  },
  async cancelSchedule(id: string): Promise<{ message: string; schedule: ScheduleItem }> {
    return fetchJson(`/api/schedules/${id}/cancel`, {
      method: 'POST'
    });
  },

  // 8. Follow-up Automations
  async getAutomations(): Promise<AutomationWorkflow[]> {
    return fetchJson('/api/automations');
  },
  async createAutomation(payload: Partial<AutomationWorkflow>): Promise<{ message: string; automation: AutomationWorkflow }> {
    return fetchJson('/api/automations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async updateAutomation(id: string, updates: Partial<AutomationWorkflow>): Promise<{ message: string; automation: AutomationWorkflow }> {
    return fetchJson(`/api/automations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  async toggleAutomation(id: string): Promise<{ message: string; automation: AutomationWorkflow }> {
    return fetchJson(`/api/automations/${id}/toggle`, {
      method: 'POST'
    });
  },
  async deleteAutomation(id: string): Promise<{ message: string }> {
    return fetchJson(`/api/automations/${id}`, {
      method: 'DELETE'
    });
  },
  async testAutomation(id: string, customer?: any): Promise<any> {
    return fetchJson(`/api/automations/${id}/trigger-test`, {
      method: 'POST',
      body: JSON.stringify({ customer })
    });
  },

  // 9. Meta Campaigns
  async getMetaCampaigns(): Promise<MetaDataResponse> {
    return fetchJson('/api/meta/campaigns');
  },
  async createMetaCampaign(payload: any): Promise<{ message: string; campaign: any }> {
    return fetchJson('/api/meta/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async toggleMetaCampaign(id: string): Promise<{ message: string; campaign: any }> {
    return fetchJson(`/api/meta/campaigns/${id}/toggle`, {
      method: 'POST'
    });
  },
  async updateMetaBudget(id: string, dailyBudget: number): Promise<{ message: string; campaign: any }> {
    return fetchJson(`/api/meta/campaigns/${id}/budget`, {
      method: 'PUT',
      body: JSON.stringify({ dailyBudget })
    });
  },

  // 10. Google Campaigns
  async getGoogleCampaigns(): Promise<GoogleDataResponse> {
    return fetchJson('/api/google/campaigns');
  },
  async createGoogleCampaign(payload: any): Promise<{ message: string; campaign: any }> {
    return fetchJson('/api/google/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async toggleGoogleCampaign(id: string): Promise<{ message: string; campaign: any }> {
    return fetchJson(`/api/google/campaigns/${id}/toggle`, {
      method: 'POST'
    });
  },
  async updateGoogleBudget(id: string, dailyBudget: number): Promise<{ message: string; campaign: any }> {
    return fetchJson(`/api/google/campaigns/${id}/budget`, {
      method: 'PUT',
      body: JSON.stringify({ dailyBudget })
    });
  },

  // 11. Integrations Vault
  async getIntegrationStatus(): Promise<IntegrationStatusResponse> {
    return fetchJson('/api/integrations/status');
  },
  async saveIntegrationCredentials(provider: string, payload: any): Promise<any> {
    return fetchJson(`/api/integrations/${provider}/save`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async verifyIntegration(provider: string): Promise<any> {
    return fetchJson(`/api/integrations/${provider}/verify`, {
      method: 'POST'
    });
  },
  async disconnectIntegration(provider: string): Promise<any> {
    return fetchJson(`/api/integrations/${provider}/disconnect`, {
      method: 'POST'
    });
  },

  // 12. Governance & Suppression
  async getSuppressionList(): Promise<SuppressionRecord[]> {
    return fetchJson('/api/governance/suppression');
  },
  async addSuppression(phone: string, reason?: string, source?: string): Promise<any> {
    return fetchJson('/api/governance/suppression/add', {
      method: 'POST',
      body: JSON.stringify({ phone, reason, source })
    });
  },
  async removeSuppression(phone: string): Promise<any> {
    return fetchJson('/api/governance/suppression/remove', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },
  async getGovernanceRules(): Promise<GovernanceRules> {
    return fetchJson('/api/governance/rules');
  },
  async saveGovernanceRules(rules: Partial<GovernanceRules>): Promise<any> {
    return fetchJson('/api/governance/rules', {
      method: 'POST',
      body: JSON.stringify(rules)
    });
  },

  // 13. Centralized Notifications (Phase 15 Addendum)
  async getNotifications(options?: { unreadOnly?: boolean; limit?: number }): Promise<InAppNotification[]> {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<InAppNotification[]>(`/api/notifications${query}`);
  },
  async getUnreadNotificationCount(): Promise<{ unreadCount: number }> {
    return fetchJson<{ unreadCount: number }>('/api/notifications/unread-count');
  },
  async createNotification(payload: Partial<InAppNotification>): Promise<InAppNotification> {
    return fetchJson<InAppNotification>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async markNotificationRead(id: string): Promise<{ success: boolean; notification: InAppNotification }> {
    return fetchJson(`/api/notifications/${id}/read`, {
      method: 'POST'
    });
  },
  async markAllNotificationsRead(): Promise<{ success: boolean; updatedCount: number }> {
    return fetchJson('/api/notifications/mark-all-read', {
      method: 'POST'
    });
  },
  async deleteNotification(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/notifications/${id}`, {
      method: 'DELETE'
    });
  },
  async clearAllNotifications(): Promise<{ success: boolean }> {
    return fetchJson('/api/notifications', {
      method: 'DELETE'
    });
  },

  // 14. Telemetry & Channel Dispatch Metrics (Phase 15.2)
  async getTelemetryMetrics(options?: { dateRange?: string; granularity?: string; timeZone?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (options?.dateRange) params.append('dateRange', options.dateRange);
    if (options?.granularity) params.append('granularity', options.granularity);
    if (options?.timeZone) params.append('timeZone', options.timeZone);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson(`/api/analytics/telemetry${query}`);
  }
};
