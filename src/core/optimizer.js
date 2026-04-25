import _ from 'lodash';

export class SurvivalOptimizer {
  constructor(applicants, phases, allianceManager) {
    this.applicants = applicants;
    this.phases = phases;
    this.allianceManager = allianceManager;
  }
  
  findOptimalPath(myId, iterations = 50) {
    const bestPaths = [];
    
    for (let i = 0; i < iterations; i++) {
      const path = this.monteCarloSimulation(myId);
      bestPaths.push(path);
    }
    
    return _.maxBy(bestPaths, 'probability');
  }
  
  monteCarloSimulation(myId) {
    let energy = 100;
    const decisions = [];
    
    for (let phase of this.phases) {
      const decision = this.makeDecision(myId, phase, energy);
      decisions.push(decision);
      
      const energyCost = phase.energyCost * (decision.effort === 'high' ? 1.2 : (decision.effort === 'low' ? 0.7 : 1.0));
      energy -= energyCost;
      
      if (energy <= 0) break;
    }
    
    const probability = this.estimateSurvivalProbability(myId, decisions);
    
    return { decisions, probability, energy };
  }
  
  makeDecision(myId, phase, energyRemaining) {
    const suggestions = this.allianceManager.suggestAlliances(myId, phase, energyRemaining);
    const alliances = suggestions.slice(0, this.determineOptimalAllianceCount(phase, energyRemaining)).map(s => s.id);
    
    const effort = this.determineOptimalEffort(phase, energyRemaining);
    
    return { phaseId: phase.id, effort, alliances };
  }
  
  determineOptimalEffort(phase, energyRemaining) {
    const isFinalPhase = phase.id === this.phases[this.phases.length - 1].id;
    const isDifficultPhase = phase.eliminationRate > 0.2;
    
    if (isFinalPhase && energyRemaining > 40) return 'high';
    if (energyRemaining < 25) return 'low';
    if (isDifficultPhase && energyRemaining > 50) return 'high';
    return 'normal';
  }
  
  determineOptimalAllianceCount(phase, energyRemaining) {
    if (phase.allianceMultiplier < 0.9) return 0;
    if (phase.allianceMultiplier > 1.1 && energyRemaining > 50) return 2;
    if (phase.allianceMultiplier > 1.0) return 1;
    return 0;
  }
  
  estimateSurvivalProbability(myId, decisions) {
    let probability = 1.0;
    let energy = 100;
    
    for (let i = 0; i < decisions.length; i++) {
      const decision = decisions[i];
      const phase = this.phases.find(p => p.id === decision.phaseId);
      
      const energyCost = phase.energyCost * (decision.effort === 'high' ? 1.2 : (decision.effort === 'low' ? 0.7 : 1.0));
      energy -= energyCost;
      
      if (energy <= 0) {
        probability *= 0.1;
        break;
      }
      
      const effortModifier = decision.effort === 'high' ? 1.3 : (decision.effort === 'low' ? 0.7 : 1.0);
      const phaseSurvival = 1 - (phase.eliminationRate / effortModifier);
      probability *= phaseSurvival;
      
      if (decision.alliances.length > 0 && phase.allianceMultiplier > 1) {
        probability *= (1 + decision.alliances.length * 0.05);
      }
    }
    
    return Math.min(1, probability);
  }
  
  identifyThreats(myId) {
    const threats = [];
    
    for (const applicant of this.applicants) {
      if (applicant.id === myId) continue;
      
      let threatScore = 0;
      threatScore += (applicant.speed - 70) / 30 * 0.25;
      threatScore += (applicant.strength - 70) / 30 * 0.25;
      threatScore += (applicant.intelligence - 70) / 30 * 0.2;
      threatScore += (applicant.nenControl - 70) / 30 * 0.3;
      
      const trust = this.allianceManager.trustScores[myId]?.[applicant.id] || 0.5;
      threatScore *= (1 - trust * 0.5);
      
      threats.push({
        ...applicant,
        threatScore: Math.max(0, Math.min(1, threatScore))
      });
    }
    
    return _.orderBy(threats, ['threatScore'], ['desc']);
  }
}