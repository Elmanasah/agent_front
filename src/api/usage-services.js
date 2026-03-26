// src/api/usage-services.js
//
// Covers both user-facing and admin-facing usage + plan endpoints.

import api from './axios.js';

// ── User: own usage ─────────────────────────────────────────────────
export const getMyUsage = () =>
  api.get('/usage/me').then(r => r.data.data);

// ── Admin: any user's usage ─────────────────────────────────────────
export const getUserUsage = (userId) =>
  api.get(`/usage/admin/${userId}`).then(r => r.data.data);

export const updateUserPlan = (userId, plan) =>
  api.patch(`/usage/admin/${userId}/plan`, { plan }).then(r => r.data.data);

export const resetUserUsage = (userId) =>
  api.post(`/usage/admin/${userId}/reset`).then(r => r.data);

export const lockUser = (userId, reason) =>
  api.post(`/usage/admin/${userId}/lock`, { reason }).then(r => r.data);

export const unlockUser = (userId) =>
  api.post(`/usage/admin/${userId}/unlock`).then(r => r.data);

export const triggerResetAll = () =>
  api.post('/usage/admin/reset-all').then(r => r.data.data);

// ── Admin: plan CRUD ────────────────────────────────────────────────
export const getAllPlans = () =>
  api.get('/plans').then(r => r.data.data);

export const getPlanByName = (name) =>
  api.get(`/plans/${name}`).then(r => r.data.data);

export const createPlan = (data) =>
  api.post('/plans', data).then(r => r.data.data);

export const updatePlan = (name, data) =>
  api.patch(`/plans/${name}`, data).then(r => r.data.data);

export const deletePlan = (name) =>
  api.delete(`/plans/${name}`);
