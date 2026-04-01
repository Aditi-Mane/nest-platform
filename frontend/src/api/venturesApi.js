import api from "./axios"; // your existing axios instance

// Ventures CRUD
export const fetchVentures = (params) => api.get("/ventures", { params });
export const fetchMyVentures = () => api.get("/ventures/my");
export const fetchVentureById = (id) => api.get(`/ventures/${id}`);
export const createVenture = (data) => api.post("/ventures", data);
export const updateVenture = (id, data) => api.patch(`/ventures/${id}`, data);
export const deleteVenture = (id) => api.delete(`/ventures/${id}`);

// Team
export const inviteTeamMember = (id, data) => api.post(`/ventures/${id}/team`, data);
export const confirmTeamInvite = (id, data) => api.patch(`/ventures/${id}/team/confirm`, data);
export const removeTeamMember = (id, userId) => api.delete(`/ventures/${id}/team/${userId}`);

// Milestones
export const addMilestone = (id, data) => api.post(`/ventures/${id}/milestones`, data);
export const updateMilestone = (id, mid, data) => api.patch(`/ventures/${id}/milestones/${mid}`, data);
export const deleteMilestone = (id, mid) => api.delete(`/ventures/${id}/milestones/${mid}`);

// Updates feed
export const postUpdate = (id, data) => api.post(`/ventures/${id}/updates`, data);

// Comments
export const addComment = (id, data) => api.post(`/ventures/${id}/comments`, data);

// Engagement
export const toggleLike = (id) => api.post(`/ventures/${id}/like`);
export const toggleFollow = (id) => api.post(`/ventures/${id}/follow`);
export const toggleEndorse = (id) => api.post(`/ventures/${id}/endorse`);

// Applications
export const applyToVenture = (id, data) => api.post(`/ventures/${id}/apply`, data);
export const fetchApplications = (id) => api.get(`/ventures/${id}/applications`);
export const updateApplication = (id, appId, data) =>
  api.patch(`/ventures/${id}/applications/${appId}`, data);
export const withdrawApplication = (id, appId) =>
  api.patch(`/ventures/${id}/applications/${appId}/withdraw`);
export const fetchMyApplications = () => api.get("/applications/mine");
export const getApplicationStatus = (ventureId) => api.get(`/applications/${ventureId}/status`);
export const getAcceptedApplications = () => api.get(`/applications/accepted`);

// Chat
export const fetchVentureMessages = (ventureId) => api.get(`/ventures/${ventureId}/messages`);
export const sendVentureMessage = (ventureId, data) =>
  api.post(`/ventures/${ventureId}/messages`, data);

// Notifications
export const fetchNotifications = () => api.get("/notifications");
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch("/notifications/read-all");
