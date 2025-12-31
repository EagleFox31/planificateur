import { Participant, SubjectType, Program } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  // Participants
  async getParticipants(): Promise<Participant[]> {
    const response = await fetch(`${API_BASE_URL}/participants`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async createParticipant(participant: Omit<Participant, 'assignmentHistory' | 'isExcluded'>): Promise<Participant> {
    const response = await fetch(`${API_BASE_URL}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participant),
    });
    return response.json();
  },

  async bulkCreateParticipants(participants: Omit<Participant, 'id' | 'assignmentHistory' | 'isExcluded'>[]): Promise<Participant[]> {
    const response = await fetch(`${API_BASE_URL}/participants/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participants),
    });
    return response.json();
  },

  async updateParticipant(id: number, participant: Partial<Participant>): Promise<Participant> {
    const response = await fetch(`${API_BASE_URL}/participants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participant),
    });
    return response.json();
  },

  async deleteParticipant(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/participants/${id}`, { method: 'DELETE' });
  },

  // Subject Types
  async getSubjectTypes(): Promise<SubjectType[]> {
    const response = await fetch(`${API_BASE_URL}/subjectTypes`);
    return response.json();
  },

  async createSubjectType(subjectType: Omit<SubjectType, 'id'>): Promise<SubjectType> {
    const response = await fetch(`${API_BASE_URL}/subjectTypes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectType),
    });
    return response.json();
  },

  async updateSubjectType(id: number, subjectType: Partial<SubjectType>): Promise<SubjectType> {
    const response = await fetch(`${API_BASE_URL}/subjectTypes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectType),
    });
    return response.json();
  },

  async deleteSubjectType(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/subjectTypes/${id}`, { method: 'DELETE' });
  },

  // Programs
  async getPrograms(): Promise<Program[]> {
    const response = await fetch(`${API_BASE_URL}/programs`);
    return response.json();
  },

  async createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program> {
    const response = await fetch(`${API_BASE_URL}/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(program),
    });
    return response.json();
  },

  async updateProgram(id: string, program: Partial<Program>): Promise<Program> {
    const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(program),
    });
    return response.json();
  },

  async deleteProgram(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/programs/${id}`, { method: 'DELETE' });
  },

  async generateProgram(startWeek: string, numWeeks: number, rolePermissions: any, startDate?: string): Promise<Program> {
    const response = await fetch(`${API_BASE_URL}/programs/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startWeek, numWeeks, rolePermissions, startDate }),
    });
    return response.json();
  },

  // Role Permissions
  async getRolePermissions(): Promise<Record<string, string[]>> {
    const response = await fetch(`${API_BASE_URL}/rolePermissions`);
    return response.json();
  },

  async updateRolePermissions(permissions: Record<string, string[]>): Promise<Record<string, string[]>> {
    const response = await fetch(`${API_BASE_URL}/rolePermissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissions),
    });
    return response.json();
  },

  // Spiritual Roles
  async getSpiritualRoles(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/spiritualRoles`);
    return response.json();
  },

  async addSpiritualRole(role: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/spiritualRoles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return response.json();
  },

  async deleteSpiritualRole(role: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/spiritualRoles/${encodeURIComponent(role)}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
