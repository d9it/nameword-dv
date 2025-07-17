// Centralized API exports
export { authApi } from './auth';
export { domainApi } from './domains';
export { domainRegistrationApi } from './domainRegistration';
export { paymentsApi } from './payments';
export { userProfileApi } from './userProfile';
export { hostingApi } from './hosting';
export { vpsApi } from './vps';
export { rdpApi } from './rdp';
export { sshApi } from './ssh';
export { firewallApi } from './firewall';
export { computeEngineApi } from './computeEngine';
export { upcloudApi } from './upcloud';
export { adminApi } from './admin';
export { telegramApi } from './telegram';

// Re-export the main API client
export { default as apiClient } from './apiClient'; 