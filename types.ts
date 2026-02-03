export interface ToolCall {
  id: string;
  name: string;
  args: any;
}

export interface ToolResponse {
  id: string;
  name: string;
  response: any;
}

export enum DroneMode {
  STANDBY = 'STANDBY',
  ATTACK = 'ATTACK',
  DEFENSE = 'DEFENSE',
  RECON = 'RECON'
}

export interface DroneLocation {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'recon' | 'combat' | 'sentry';
  targetX?: number;
  targetY?: number;
}

export interface SuitLocation {
  id: string;
  mark: string;
  x: number;
  y: number;
  status: 'STATIONARY' | 'IN_FLIGHT' | 'ENGAGING';
}

export interface SystemStatus {
  drones: number;
  threatLevel: string;
  authorized: boolean;
}