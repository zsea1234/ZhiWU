// app/services/tenant/lease.ts
import api, { tenantAuth } from './api';

export interface Lease {
  id: number;
  property_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  status: 'draft' | 'pending_tenant_signature' | 'pending_landlord_signature' | 'active' | 'expired' | 'terminated_early' | 'payment_due'
  created_at: string;
  updated_at: string;
  property: {
    id: number;
    title: string;
    address_summary: string;
  };
}

export interface LeaseDocument {
  id: number;
  lease_id: number;
  document_type: 'contract' | 'inventory' | 'other';
  file_url: string;
  created_at: string;
}

export const leaseService = {
  getLeases: async (): Promise<Lease[]> => {
    await tenantAuth.checkAuth();
    const response = await api.get<Lease[]>('/leases');
    return response.data;
  },

  getLeaseById: async (id: number): Promise<Lease> => {
    await tenantAuth.checkAuth();
    const response = await api.get<Lease>(`/leases/${id}`);
    return response.data;
  },

  getLeaseDocuments: async (leaseId: number): Promise<LeaseDocument[]> => {
    await tenantAuth.checkAuth();
    const response = await api.get<LeaseDocument[]>(`/leases/${leaseId}/documents`);
    return response.data;
  },

  downloadLeaseDocument: async (leaseId: number, documentId: number): Promise<Blob> => {
    await tenantAuth.checkAuth();
    const response = await api.get<Blob>(`/leases/${leaseId}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data as Blob;
  }
};