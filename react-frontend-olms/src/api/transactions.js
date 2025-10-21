// Transaction management API services
import apiClient from './index';

export const transactionsAPI = {
  getDashboard: () => apiClient.get('/dashboard/'),
  getBorrowedBooks: () => apiClient.get('/my-borrowed/'),
  getBorrowingHistory: () => apiClient.get('/borrowing-history/'),
};