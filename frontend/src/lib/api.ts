const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  };
}

interface Patient {
  id: string;
  anonymous_id: string;
  age?: number;
  gender?: string;
  symptoms_anonymized: string;
  vitals: string;
  created_at: string;
  created_by: string;
}

interface TriageNote {
  id: string;
  patient_id: string;
  urgency: string;
  chief_complaint: string;
  vitals_and_labs: string;
  urgency_signals: string[] | string;
  missing_info: string[] | string;
  suggested_questions: string[] | string;
  created_at: string;
}

class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.request('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async createPatient(data: {
    anonymous_id: string;
    age?: number;
    gender?: string;
    symptoms_text: string;
    vitals: Record<string, any>;
  }): Promise<Patient> {
    const response = await this.request('/api/patients/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async assessTriage(data: {
    patient_id: string;
    symptoms: string;
    vitals: Record<string, any>;
    lab_results?: Record<string, any>;
  }): Promise<TriageNote> {
    const response = await this.request('/api/triage/assess', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async getTriageQueue(): Promise<any[]> {
    const response = await this.request('/api/triage/queue');
    return response.json();
  }

  async recordConsent(data: {
    patient_id: string;
    consent_type: string;
    granted: boolean;
    consent_method: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const response = await this.request('/api/consent/record', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async aiChat(data: {
    message: string;
    conversation_history?: Array<{ role: string; content: string; timestamp?: string }>;
    patient_context?: Record<string, any>;
  }): Promise<{
    response: string;
    conversation_history: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>;
    disclaimer: string;
    prescription_suggestion?: boolean;
    prescription_data?: any;
  }> {
    const response = await this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async generatePrescription(data: {
    patient_name?: string;
    age?: string;
    gender?: string;
    symptoms: string;
    vitals?: Record<string, any>;
    language?: string;
    conversation_history?: Array<{ role: string; content: string; timestamp?: string }>;
  }): Promise<{
    rx_id: string;
    date: string;
    phc_name: string;
    patient_name: string;
    age_gender: string;
    symptoms_summary: string;
    clinical_assessment: string;
    medicines: Array<{
      name: string;
      type: string;
      dosage: string;
      frequency: string;
      timing: string;
      duration: string;
      instructions: string;
      precautions: string;
    }>;
    home_care_and_diet: string[];
    precautions_and_warnings: string[];
    when_to_see_doctor: string;
    disclaimer: string;
    formatted_slip_text: string;
  }> {
    const response = await this.request('/api/ai/generate-prescription', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  }
}

export const apiClient = new APIClient();

