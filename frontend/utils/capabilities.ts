import { Gender, ParticipantCapabilities, SpiritualRole, CapabilityKey, RolePermissions } from '../types';

export const CAPABILITY_LABELS: Record<CapabilityKey, string> = {
  canPreside: 'Présider / diriger la réunion',
  canPrayerOpening: 'Prière d’ouverture',
  canPrayerClosing: 'Prière de clôture',
  canJoyaux: 'Joyaux de la Parole',
  canPerles: 'Perles spirituelles',
  canBibleReading: 'Lecture de la Bible',
  canApplication: 'Applique-toi au ministère (sujets)',
  canTalk: 'Discours spéciaux',
  canLifeChristian: 'Vie chrétienne (discours)',
  canNeeds: 'Besoins de l’assemblée',
  canAssemblyStudy: 'Étude biblique de l’assemblée',
  canReadEBA: 'Lecteur paragraphes EBA',
};

export const CAPABILITY_ORDER: CapabilityKey[] = [
  'canPreside',
  'canPrayerOpening',
  'canPrayerClosing',
  'canJoyaux',
  'canPerles',
  'canBibleReading',
  'canApplication',
  'canTalk',
  'canLifeChristian',
  'canNeeds',
  'canAssemblyStudy',
  'canReadEBA',
];

const normalizeRole = (role: SpiritualRole) => role?.toLowerCase() || '';

const createEmptyCapabilities = (): ParticipantCapabilities => ({
  canPreside: false,
  canPrayerOpening: false,
  canPrayerClosing: false,
  canJoyaux: false,
  canPerles: false,
  canBibleReading: false,
  canApplication: false,
  canTalk: false,
  canLifeChristian: false,
  canNeeds: false,
  canAssemblyStudy: false,
  canReadEBA: false,
});

const getFallbackCapabilities = (role: SpiritualRole, gender: Gender): ParticipantCapabilities => {
  const normalizedRole = normalizeRole(role);
  const isAncient = normalizedRole.includes('ancien');
  const isAssistant = normalizedRole.includes('assistant');
  const isNewStudent = normalizedRole.includes('nouveau');
  const isFemale = gender === Gender.FEMALE;

  const base = createEmptyCapabilities();

  if (isAncient) {
    base.canPreside = true;
    base.canPrayerOpening = true;
    base.canPrayerClosing = true;
    base.canJoyaux = true;
    base.canPerles = true;
    base.canLifeChristian = true;
    base.canNeeds = true;
    base.canAssemblyStudy = true;
    base.canReadEBA = true;
  }

  if (isAssistant) {
    base.canPrayerOpening = true;
    base.canPrayerClosing = true;
    base.canJoyaux = true;
    base.canPerles = true;
    base.canBibleReading = true;
    base.canReadEBA = true;
  }

  if (!isAncient && !isAssistant) {
    if (!isFemale) {
      base.canBibleReading = isNewStudent;
    } else {
      base.canApplication = true;
    }
  }

  return base;
};

export const getRoleCapabilityDefaults = (
  rolePermissions: RolePermissions | undefined,
  role: SpiritualRole,
  gender: Gender
): ParticipantCapabilities => {
  const entry = rolePermissions?.[role];
  if (entry?.capabilities) {
    return { ...entry.capabilities };
  }
  return getFallbackCapabilities(role, gender);
};

export const cloneCapabilities = (caps?: ParticipantCapabilities): ParticipantCapabilities =>
  caps ? { ...caps } : createEmptyCapabilities();

// Default capabilities derived from role/gender when no explicit permissions exist.
export const getDefaultCapabilities = (role: SpiritualRole, gender: Gender): ParticipantCapabilities =>
  getFallbackCapabilities(role, gender);
