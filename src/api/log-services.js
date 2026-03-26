// src/api/log-services.js

import api from './axios.js';

// Current user's own activity log
export const getMyLogs = ({ page = 1, limit = 20, category } = {}) => {
  const params = { page, limit };
  if (category) params.category = category;
  return api.get('/logs/me', { params }).then(r => r.data);
};

// Admin: all logs, filterable
export const getAllLogs = ({ page = 1, limit = 50, category, userId } = {}) => {
  const params = { page, limit };
  if (category) params.category = category;
  if (userId)   params.userId   = userId;
  return api.get('/logs', { params }).then(r => r.data);
};
