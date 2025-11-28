

export enum AppState {
  LOADING,
  SPLASH,
  ONBOARDING,
  MAIN_APP,
}

export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  PARTICIPANTS = 'PARTICIPANTS',
  SUBJECTS = 'SUBJECTS',
  STATISTICS = 'STATISTICS',
  ROLES = 'ROLES',
  UNAVAILABILITIES = 'UNAVAILABILITIES',
  PROGRAMS = 'PROGRAMS',
  MY_ASSIGNMENTS = 'MY_ASSIGNMENTS',
  PARTICIPANT_HISTORY = 'PARTICIPANT_HISTORY',
  ROTATION_RULES = 'ROTATION_RULES',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export type SpiritualRole = string;

export interface ParticipantCapabilities {
  canPreside?: boolean;
  canPrayerOpening?: boolean;
  canPrayerClosing?: boolean;
  canJoyaux?: boolean;
  canPerles?: boolean;
  canBibleReading?: boolean;
  canApplication?: boolean;
  canTalk?: boolean;
  canLifeChristian?: boolean;
  canNeeds?: boolean;
  canAssemblyStudy?: boolean;
  canReadEBA?: boolean;
}

export type CapabilityKey = keyof ParticipantCapabilities;

export interface RolePermissionConfig {
  colors: string[];
  capabilities: ParticipantCapabilities;
}

export type RolePermissions = {
  [key in SpiritualRole]?: RolePermissionConfig;
};

export enum RelationshipType {
  PARENT = 'PARENT',
  ENFANT = 'ENFANT',
  FRERE = 'FRERE',
  SOEUR = 'SOEUR',
}

export const relationshipTypeLabels: { [key in RelationshipType]: string } = {
  [RelationshipType.PARENT]: 'Parent de',
  [RelationshipType.ENFANT]: 'Enfant de',
  [RelationshipType.FRERE]: 'Frère de',
  [RelationshipType.SOEUR]: 'Sœur de',
};

export interface Affiliation {
  relationship: RelationshipType;
  withParticipantId: number;
}

export interface Participant {
  id: number;
  name: string;
  age?: number | null;
  gender: Gender;
  spiritualRole: SpiritualRole;
  unavailabilities: string[]; // e.g., ['2024-W32', '2024-W33']
  assignmentHistory: { subjectTypeId: number; week: string }[];
  affiliation: Affiliation[];
  notes?: string;
  isExcluded: boolean;
  exclusionEndDate?: string; // ISO date string, e.g., '2024-08-31'
  capabilities?: ParticipantCapabilities;
}

export interface SubjectType {
  id: number;
  mainTopic: string;
  label: string;
  color: string;
  rotationWeeks: number;
  nbParticipants: number;
  requiredGender?: Gender;
  requiredSpiritualRole?: SpiritualRole;
  requiredCapability?: CapabilityKey;
  isBinome?: boolean; // pair of same gender or family
  uppercaseTitle?: boolean;
  isArchived?: boolean;
}

export interface Assignment {
  id: string; // unique identifier for the assignment instance
  week: string; // e.g., '2024-W30'
  subjectTypeId: number;
  participantIds: number[];
  customLabel?: string;
}

export interface Program {
  id: string; // unique ID for the program, e.g., timestamp
  title: string;
  weekRange: { start: string; end: string };
  assignments: Assignment[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: 'draft' | 'published';
}
