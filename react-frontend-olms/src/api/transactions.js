// Transaction management API services
import apiClient, { apiRequest } from './index';

// Transaction filtering utilities
export const transactionFilters = {
  buildSearchParams: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.user) {
      params.append('user', filters.user);
    }
    if (filters.book) {
      params.append('book', filters.book);
    }
    if (filters.book_title) {
      params.append('book_title', filters.book_title);
    }
    if (filters.transaction_type) {
      params.append('transaction_type', filters.transaction_type);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.is_overdue !== undefined) {
      params.append('is_overdue', filters.is_overdue);
    }
    if (filters.date_from) {
      params.append('date_from', filters.date_from);
    }
    if (filters.date_to) {
      params.append('date_to', filters.date_to);
    }
    if (filters.due_date_from) {
      params.append('due_date_from', filters.due_date_from);
    }
    if (filters.due_date_to) {
      params.append('due_date_to', filters.due_date_to);
    }
    if (filters.ordering) {
      params.append('ordering', filters.ordering);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.page_size) {
      params.append('page_size', filters.page_size);
    }
    
    return params.toString();
  }
};

// Main transactions API
export const transactionsAPI = {
  // Dashboard and overview
  getDashboard: () => apiRequest(() => apiClient.get('/dashboard/')),
  
  getAdminDashboard: () => apiRequest(() => apiClient.get('/dashboard/admin/')),
  
  // Borrowed books management
  getBorrowedBooks: (filters = {}) => {
    const searchParams = transactionFilters.buildSearchParams(filters);
    const url = searchParams ? `/my-borrowed-books/?${searchParams}` : '/my-borrowed-books/';
    return apiRequest(() => apiClient.get(url));
  },
  
  getAllBorrowedBooks: (filters = {}) => {
    const searchParams = transactionFilters.buildSearchParams(filters);
    const url = searchParams ? `/dashboard/borrowed-books/?${searchParams}` : '/dashboard/borrowed-books/';
    return apiRequest(() => apiClient.get(url));
  },
  
  // Borrowing history and tracking
  getBorrowingHistory: (filters = {}) => {
    const searchParams = transactionFilters.buildSearchParams(filters);
    const url = searchParams ? `/transactions/?${searchParams}` : '/transactions/';
    return apiRequest(() => apiClient.get(url));
  },
  
  getAllBorrowingHistory: (filters = {}) => {
    const searchParams = transactionFilters.buildSearchParams(filters);
    const url = searchParams ? `/dashboard/borrowing-history/?${searchParams}` : '/dashboard/borrowing-history/';
    return apiRequest(() => apiClient.get(url));
  },
  
  // Transaction details
  getTransactionById: (id) => apiRequest(() => apiClient.get(`/transactions/${id}/`)),
  
  getUserTransactions: (userId, filters = {}) => {
    const searchFilters = { ...filters, user: userId };
    return transactionsAPI.getAllBorrowingHistory(searchFilters);
  },
  
  getBookTransactions: (bookId, filters = {}) => {
    const searchFilters = { ...filters, book: bookId };
    return transactionsAPI.getAllBorrowingHistory(searchFilters);
  },
  
  // Overdue books management
  getOverdueBooks: (filters = {}) => {
    const searchFilters = { ...filters, is_overdue: true };
    return transactionsAPI.getAllBorrowedBooks(searchFilters);
  },
  
  getMyOverdueBooks: (filters = {}) => {
    const searchFilters = { ...filters, is_overdue: true };
    return transactionsAPI.getBorrowedBooks(searchFilters);
  },
  
  // Return functionality
  returnBook: (transactionId, returnData = {}) => apiRequest(() => 
    apiClient.post(`/transactions/${transactionId}/return/`, returnData)
  ),
  
  bulkReturnBooks: (transactionIds, returnData = {}) => apiRequest(() => 
    apiClient.post('/transactions/bulk-return/', { 
      transaction_ids: transactionIds, 
      return_data: returnData 
    })
  ),
  
  // Fine management
  calculateFine: (transactionId) => apiRequest(() => 
    apiClient.get(`/transactions/${transactionId}/calculate-fine/`)
  ),
  
  payFine: (transactionId, paymentData = {}) => apiRequest(() => 
    apiClient.post(`/transactions/${transactionId}/pay-fine/`, paymentData)
  ),
  
  // Search and filtering
  search: (query, filters = {}) => {
    const searchFilters = { ...filters, search: query };
    return transactionsAPI.getAllBorrowingHistory(searchFilters);
  },
  
  searchByBookTitle: (title, filters = {}) => {
    const searchFilters = { ...filters, book_title: title };
    return transactionsAPI.getAllBorrowingHistory(searchFilters);
  },
  
  filterByTransactionType: (type, filters = {}) => {
    const searchFilters = { ...filters, transaction_type: type };
    return transactionsAPI.getAllBorrowingHistory(searchFilters);
  },
  
  filterByStatus: (status, filters = {}) => {
    const searchFilters = { ...filters, status };
    return transactionsAPI.getAllBorrowedBooks(searchFilters);
  },
  
  filterByDateRange: (dateFrom, dateTo, filters = {}) => {
    const searchFilters = { ...filters, date_from: dateFrom, date_to: dateTo };
    return transactionsAPI.getAllBorrowingHistory(searchFilters);
  },
  
  filterByDueDateRange: (dueDateFrom, dueDateTo, filters = {}) => {
    const searchFilters = { ...filters, due_date_from: dueDateFrom, due_date_to: dueDateTo };
    return transactionsAPI.getAllBorrowedBooks(searchFilters);
  },
  
  // Statistics and reports
  getTransactionStats: () => apiRequest(() => apiClient.get('/dashboard/transactions/stats/')),
  
  getBorrowingStats: () => apiRequest(() => apiClient.get('/dashboard/borrowing/stats/')),
  
  getOverdueStats: () => apiRequest(() => apiClient.get('/dashboard/overdue/stats/')),
  
  getFineStats: () => apiRequest(() => apiClient.get('/dashboard/fines/stats/')),
  
  // Renewal functionality
  renewBook: (transactionId, renewalData = {}) => apiRequest(() => 
    apiClient.post(`/transactions/${transactionId}/renew/`, renewalData)
  ),
  
  bulkRenewBooks: (transactionIds, renewalData = {}) => apiRequest(() => 
    apiClient.post('/transactions/bulk-renew/', { 
      transaction_ids: transactionIds, 
      renewal_data: renewalData 
    })
  ),
  
  // Pagination helpers
  getPage: (page, pageSize = 10, filters = {}) => {
    const searchFilters = { ...filters, page, page_size: pageSize };
    return transactionsAPI.getAllBorrowingHistory(searchFilters);
  },
  
  getBorrowedBooksPage: (page, pageSize = 10, filters = {}) => {
    const searchFilters = { ...filters, page, page_size: pageSize };
    return transactionsAPI.getAllBorrowedBooks(searchFilters);
  },
  
  // Direct API calls (without wrapper)
  getDashboardDirect: () => apiClient.get('/dashboard/'),
  getBorrowedBooksDirect: (filters = {}) => {
    const searchParams = transactionFilters.buildSearchParams(filters);
    const url = searchParams ? `/my-borrowed-books/?${searchParams}` : '/my-borrowed-books/';
    return apiClient.get(url);
  },
  getBorrowingHistoryDirect: (filters = {}) => {
    const searchParams = transactionFilters.buildSearchParams(filters);
    const url = searchParams ? `/transactions/?${searchParams}` : '/transactions/';
    return apiClient.get(url);
  },
  getAllBorrowedBooksDirect: (filters = {}) => {
    const searchParams = transactionFilters.buildSearchParams(filters);
    const url = searchParams ? `/dashboard/borrowed-books/?${searchParams}` : '/dashboard/borrowed-books/';
    return apiClient.get(url);
  },
  returnBookDirect: (transactionId, returnData = {}) => apiClient.post(`/transactions/${transactionId}/return/`, returnData),
};