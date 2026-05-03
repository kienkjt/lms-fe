import api from './api';

export const withdrawalService = {
  /**
   * Get instructor wallet information
   * Backend returns:
   * - currentBalance: Available to withdraw (tiền sẵn sàng rút)
   * - pendingBalance: Waiting for settlement release (tiền chờ release sau 7 ngày)
   * - availableBalance: currentBalance (available to withdraw)
   * - totalEarned: Total earnings lifetime
   * - totalWithdrawn: Successfully withdrawn amount
   * - totalCommissionDeducted: Total commission deducted from withdrawals
   * - pendingWithdrawalAmount: Sum of PENDING + APPROVED withdrawals
   * @returns Response with wallet data
   */
  getWallet: async () => {
    try {
      console.log('[withdrawalService.getWallet] Fetching wallet information');
      const response = await api.get('/api/v1/withdrawal/wallet');
      const wallet = response.data?.data || response.data;
      console.log('[withdrawalService.getWallet] Success', {
        currentBalance: wallet?.currentBalance,
        pendingBalance: wallet?.pendingBalance,
        totalEarned: wallet?.totalEarned,
      });
      return { data: wallet };
    } catch (error) {
      console.error('[withdrawalService.getWallet] Error:', error);
      throw error;
    }
  },

  /**
   * Create a withdrawal request
   * Backend logic:
   * 1. Deduct requestedAmount from currentBalance immediately
   * 2. Calculate commission = requestedAmount * commissionRate
   * 3. netAmount = requestedAmount - commission
   * 4. Status starts as PENDING
   * @param {object} data - Withdrawal request data
   *   { requestedAmount, accountHolder, bankName, bankAccount, reason }
   * @returns Response with withdrawal request
   */
  createRequest: async (data) => {
    try {
      console.log('[withdrawalService.createRequest] Creating withdrawal request', {
        amount: data.requestedAmount,
        bank: data.bankName,
      });
      const response = await api.post('/api/v1/withdrawal/request', {
        requestedAmount: data.requestedAmount,
        accountHolder: data.accountHolder,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        reason: data.reason || '',
      });
      const request = response.data?.data || response.data;
      console.log('[withdrawalService.createRequest] Success:', {
        id: request.id,
        netAmount: request.netAmount,
        commission: request.commissionAmount,
      });
      return { data: request };
    } catch (error) {
      console.error('[withdrawalService.createRequest] Error:', error);
      throw error;
    }
  },

  /**
   * Get all withdrawal requests for current instructor (paginated)
   * Backend returns paginated results with:
   * - PENDING: Awaiting admin approval
   * - APPROVED: Approved, awaiting completion
   * - COMPLETED: Successfully transferred
   * - REJECTED: Rejected by admin
   * - CANCELLED: Cancelled by instructor
   * @param {object} params - Pagination params { page, size }
   * @returns Response with paginated withdrawal requests
   */
  getMyRequests: async (params) => {
    try {
      const page = params?.page ?? 0;
      const size = params?.size || 10;
      console.log('[withdrawalService.getMyRequests] Fetching withdrawal requests', { page, size });
      const response = await api.get(
        `/api/v1/withdrawal/requests?page=${page}&size=${size}`
      );
      const data = response.data?.data || response.data;
      console.log('[withdrawalService.getMyRequests] Success, count:', data?.content?.length || data?.length);
      return { data };
    } catch (error) {
      console.error('[withdrawalService.getMyRequests] Error:', error);
      throw error;
    }
  },

  /**
   * Get a specific withdrawal request by ID
   * @param {string} requestId - Withdrawal request ID
   * @returns Response with withdrawal request
   */
  getRequest: async (requestId) => {
    try {
      console.log('[withdrawalService.getRequest] Fetching withdrawal request:', requestId);
      const response = await api.get(`/api/v1/withdrawal/request/${requestId}`);
      const request = response.data?.data || response.data;
      console.log('[withdrawalService.getRequest] Success');
      return { data: request };
    } catch (error) {
      console.error('[withdrawalService.getRequest] Error:', error);
      throw error;
    }
  },

  /**
   * Cancel a withdrawal request (only PENDING requests)
   * Backend logic:
   * - Only PENDING requests can be cancelled
   * - Refunds the requestedAmount back to currentBalance
   * - Sets status to CANCELLED
   * @param {string} requestId - Withdrawal request ID
   * @returns Response with cancelled withdrawal
   */
  cancelRequest: async (requestId) => {
    try {
      console.log('[withdrawalService.cancelRequest] Cancelling withdrawal request:', requestId);
      const response = await api.post(`/api/v1/withdrawal/request/${requestId}/cancel`);
      const request = response.data?.data || response.data;
      console.log('[withdrawalService.cancelRequest] Success');
      return { data: request };
    } catch (error) {
      console.error('[withdrawalService.cancelRequest] Error:', error);
      throw error;
    }
  },

  /**
   * Settlement release scheduled task (backend only)
   * Automatic process that runs every hour:
   * 1. Finds SETTLEMENT entries (from order payments) with availableAt <= now
   * 2. Moves amount from pendingBalance to currentBalance
   * 3. Marks settlement as COMPLETED
   * 
   * Frontend note: This is automatic, no need to call manually
   */
  
  getPendingWithdrawals: async (params) => {
    try {
      const page = params?.page ?? 0;
      const size = params?.size || 10;
      const response = await api.get(`/api/v1/withdrawal/admin/pending?page=${page}&size=${size}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[withdrawalService.getPendingWithdrawals] Error:', error);
      throw error;
    }
  },

  getAllWithdrawals: async (params) => {
    try {
      const page = params?.page ?? 0;
      const size = params?.size || 10;
      const response = await api.get(`/api/v1/withdrawal/admin/all?page=${page}&size=${size}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[withdrawalService.getAllWithdrawals] Error:', error);
      throw error;
    }
  },

  getWithdrawalsByStatus: async (status, params) => {
    try {
      const page = params?.page ?? 0;
      const size = params?.size || 10;
      const response = await api.get(`/api/v1/withdrawal/admin/status/${status}?page=${page}&size=${size}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[withdrawalService.getWithdrawalsByStatus] Error:', error);
      throw error;
    }
  },

  approveWithdrawal: async (requestId) => {
    try {
      const response = await api.post(`/api/v1/withdrawal/admin/approve/${requestId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[withdrawalService.approveWithdrawal] Error:', error);
      throw error;
    }
  },

  rejectWithdrawal: async (requestId, rejectReason) => {
    try {
      const response = await api.post(
        `/api/v1/withdrawal/admin/reject/${requestId}`,
        null,
        { params: { rejectReason } }
      );
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[withdrawalService.rejectWithdrawal] Error:', error);
      throw error;
    }
  },

  completeWithdrawal: async (requestId, transactionId) => {
    try {
      const response = await api.post(
        `/api/v1/withdrawal/admin/complete/${requestId}`,
        null,
        { params: { transactionId } }
      );
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[withdrawalService.completeWithdrawal] Error:', error);
      throw error;
    }
  },
};
