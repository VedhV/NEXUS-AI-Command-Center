export type TabType = 'dashboard' | 'security' | 'console' | 'tasks' | 'notes' | 'ai';

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  neuralLatency: number;
  activeNodes: number;
  threatLevel: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  networkTraffic: number; // MB/s
  uptime: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'INTRUSION_ATTEMPT' | 'PORT_SCAN' | 'FIREWALL_BLOCK' | 'AI_ANOMALY' | 'SECURE_PING';
  source: string;
  destination: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

export interface SecurityCheckItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'secure' | 'warning' | 'advisory';
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  completed: boolean;
  timestamp: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nexus';
  text: string;
  timestamp: string;
}
