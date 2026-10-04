export type ConnectionStatus = 
  | 'untested'       // Not yet probed
  | 'checking'       // Probe in flight
  | 'reachable'      // Successfully responded (HTTP 200-399 or no-cors reached)
  | 'cors_restricted'// Responded to network probe but browser CORS prevented header inspection
  | 'unreachable';   // Connection timed out or DNS/network error

export type EmbedMode = 'iframe' | 'new_tab' | 'auto';

export interface SystemItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  url: string;
  healthCheckUrl?: string;
  icon: 'calculator' | 'copper' | 'warehouse' | 'chiller' | 'network' | 'analytics' | 'shield' | 'terminal';
  embedMode: EmbedMode;
  tags: string[];
  order: number;
  accentColor?: string;
  internalCode?: string;
  status: ConnectionStatus;
  latencyMs?: number;
  lastChecked?: string;
  statusMessage?: string;
}

export interface PortalSettings {
  companyName: string;
  portalTitle: string;
  executiveRole: string;
  executiveName: string;
  allowIframeDefault: boolean;
  autoPingOnLoad: boolean;
}
