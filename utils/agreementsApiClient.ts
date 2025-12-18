// utils/agreementsApiClient.ts
import { createApiUrl } from './apiConfig'; // ✅ Use centralized configuration

interface AgreementResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const agreementApi = {
  /**
   * Get the status of an agreement for a booking
   */
  getAgreementStatus: async (bookingId: string, token: string): Promise<AgreementResponse> => {
    try {
      // ✅ Use createApiUrl to guarantee the correct backend address
      const url = createApiUrl(`bookings/${bookingId}/rental-agreement`);
      
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      if (!res.ok) return { success: false, data: { status: 'NOT_INITIALIZED' } };
      return data; 
    } catch (error) {
      console.error("Error fetching agreement status:", error);
      return { success: false, data: { status: 'ERROR' } };
    }
  },

  /**
   * Upload signature for an agreement
   */
  uploadSignature: async (agreementId: string, role: 'tenant' | 'landlord', file: File, token: string): Promise<AgreementResponse> => {
    try {
      // ✅ Use createApiUrl to generate the absolute production path
      const url = createApiUrl(`agreements/${agreementId}/sign/${role}`);
      
      const formData = new FormData();
      formData.append('signature', file);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
          // Note: Content-Type is NOT set manually for FormData to allow the browser to set boundaries
        },
        body: formData
      });

      return await res.json();
    } catch (error) {
      console.error("Signature upload error:", error);
      return { success: false, message: "Network Error" };
    }
  }
};