import _ from 'lodash';

export class AllianceManager {
  constructor(applicants) {
    this.applicants = applicants;
    this.trustScores = this.generateTrustEstimates();
    this.trueTrustScores = this.generateTrueTrust();
    this.allianceHistory = [];
  }
  
  generateTrustEstimates() {
    const estimates = {};
    for (const a of this.applicants) {
      estimates[a.id] = {};
      for (const b of this.applicants) {
        if (a.id !== b.id) {
          const baseTrust = (a.teamwork + b.teamwork) / 200;
          const noise = (Math.random() - 0.5) * 0.3;
          estimates[a.id][b.id] = Math.max(0, Math.min(1, baseTrust + noise));
        }
      }
    }
    return estimates;
  }
  
  generateTrueTrust() {
    const trueTrust = {};
    for (const a of this.applicants) {
      trueTrust[a.id] = {};
      for (const b of this.applicants) {
        if (a.id !== b.id) {
          const compatibility = (
            (a.teamwork + b.teamwork) / 200 +
            (Math.abs(a.intelligence - b.intelligence) / 100) * 0.3 +
            (Math.random() - 0.5) * 0.2
          );
          trueTrust[a.id][b.id] = Math.max(0, Math.min(1, compatibility));
        }
      }
    }
    return trueTrust;
  }
  
  suggestAlliances(myId, phase, energyRemaining) {
    const candidates = this.applicants.filter(a => a.id !== myId && a.survived);
    const suggestions = candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      estimatedTrust: this.trustScores[myId][candidate.id],
      teamwork: candidate.teamwork,
      value: this.calculateAllianceValue(myId, candidate.id, phase, energyRemaining)
    }));
    
    return _.orderBy(suggestions, ['value'], ['desc']).slice(0, 3);
  }
  
  calculateAllianceValue(myId, candidateId, phase, energyRemaining) {
    const trust = this.trustScores[myId][candidateId];
    const candidate = this.applicants.find(a => a.id === candidateId);
    const teamworkBonus = candidate.teamwork / 100;
    const phaseModifier = phase.allianceMultiplier || 1.0;
    const energyModifier = energyRemaining < 30 ? 0.5 : 1.0;
    
    return trust * (1 + teamworkBonus) * phaseModifier * energyModifier;
  }
  
  testAlliance(myId, candidateId) {
    const trueTrust = this.trueTrustScores[myId][candidateId];
    const success = Math.random() < trueTrust;
    
    if (success) {
      this.trustScores[myId][candidateId] = trueTrust;
    } else {
      this.trustScores[myId][candidateId] *= 0.7;
    }
    
    return {
      success,
      actualTrust: trueTrust,
      updatedEstimate: this.trustScores[myId][candidateId]
    };
  }
  
  updateTrustFromPhase(myId, alliances, phaseResult) {
    for (const allyId of alliances) {
      const trueTrust = this.trueTrustScores[myId][allyId];
      const performance = phaseResult?.myScore || 50;
      const adjustment = (performance - 50) / 50;
      
      this.trustScores[myId][allyId] = Math.max(0, Math.min(1, 
        this.trustScores[myId][allyId] + adjustment * 0.1
      ));
    }
  }
}