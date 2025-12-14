// utils/agreementsApiClient.ts

// Adjust base URL to match your proxy or backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const agreementApi = {
  getAgreementStatus: async (bookingId: string, token: string) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/rental-agreement`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      if (!res.ok) return { success: false, data: { status: 'NOT_INITIALIZED' } };
      return data; 
    } catch (error) {
      return { success: false, data: { status: 'ERROR' } };
    }
  },

  uploadSignature: async (agreementId: string, role: 'tenant' | 'landlord', file: File, token: string) => {
    const formData = new FormData();
    formData.append('signature', file);

    const res = await fetch(`${API_URL}/agreements/${agreementId}/sign/${role}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    return await res.json();
  }
};