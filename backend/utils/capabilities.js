const getDefaultCapabilities = (role = '', gender = 'MALE') => {
  const normalizedRole = (role || '').toLowerCase();
  const isAncient = normalizedRole.includes('ancien');
  const isAssistant = normalizedRole.includes('assistant');
  const isNewStudent = normalizedRole.includes('nouveau');
  const isFemale = gender === 'FEMALE';

  const base = {
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
  };

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

const hasCapability = (participant, capability) => {
  if (!capability) return true;
  const caps = participant.capabilities;
  if (caps && typeof caps[capability] !== 'undefined') {
    return !!caps[capability];
  }
  const defaults = getDefaultCapabilities(participant.spiritualRole, participant.gender);
  return !!defaults[capability];
};

module.exports = { getDefaultCapabilities, hasCapability };
