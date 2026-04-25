import _ from 'lodash';

export class ExamSimulator {
  constructor(applicants, phases) {
    this.applicants = applicants.map(a => ({ ...a, energy: 100, survived: true }));
    this.phases = phases;
    this.history = [];
  }

  calculatePhaseScore(applicant, phase, effort = 'normal', allianceBonus = 0) {
    const effortMultiplier = effort === 'high' ? 1.3 : (effort === 'low' ? 0.7 : 1.0);
    const stats = applicant.isRinger && applicant.trueStats ? applicant.trueStats : applicant;
    
    let score = 0;
    for (const [stat, weight] of Object.entries(phase.statRequirements)) {
      score += (stats[stat] || 0) * weight * effortMultiplier;
    }
    
    return score * (1 + allianceBonus);
  }

  simulatePhase(phase, myId, decisions, trustScores) {
    const survivors = this.applicants.filter(a => a.survived);
    const myApplicant = survivors.find(a => a.id === myId);
    
    if (!myApplicant) return { eliminated: true, phaseResult: null };
    
    const phaseIndex = this.phases.findIndex(p => p.id === phase.id);
    const previousDecisions = decisions[phaseIndex - 1];
    
    const effort = previousDecisions?.effort || 'normal';
    const allianceIds = previousDecisions?.alliances || [];
    
    let allianceBonus = 0;
    if (allianceIds.length > 0 && phase.allianceMultiplier > 0) {
      allianceBonus = Math.min(0.3, allianceIds.length * 0.05) * phase.allianceMultiplier;
    }
    
    const myScore = this.calculatePhaseScore(myApplicant, phase, effort, allianceBonus);
    
    const results = survivors.map(applicant => {
      const applicantScore = this.calculatePhaseScore(applicant, phase, 'normal', 0);
      const eliminationChance = this.calculateEliminationChance(applicantScore, myScore, phase);
      const eliminated = Math.random() < eliminationChance;
      
      const energyCost = phase.energyCost * (effort === 'high' ? 1.2 : (effort === 'low' ? 0.7 : 1.0));
      
      return { applicant, eliminated, energyCost, score: applicantScore };
    });
    
    const myResult = results.find(r => r.applicant.id === myId);
    const eliminated = myResult.eliminated;
    
    if (!eliminated) {
      myApplicant.energy -= myResult.energyCost;
      if (myApplicant.energy <= 0) return { eliminated: true, phaseResult: null };
    }
    
    results.forEach(result => {
      if (result.eliminated) result.applicant.survived = false;
      else if (result.applicant.id !== myId) result.applicant.energy -= result.energyCost;
    });
    
    const phaseResult = {
      phaseId: phase.id,
      survivors: this.applicants.filter(a => a.survived).length,
      myEnergy: myApplicant.energy,
      eliminated,
      effort,
      alliances: allianceIds
    };
    
    this.history.push(phaseResult);
    
    return { eliminated, phaseResult };
  }
  
  calculateEliminationChance(applicantScore, myScore, phase) {
    const diff = myScore - applicantScore;
    const baseChance = phase.eliminationRate;
    return Math.max(0.05, Math.min(0.95, baseChance + (diff * -0.02)));
  }
  
  getSurvivalProbability(strategy, iterations = 100) {
    let survivals = 0;
    for (let i = 0; i < iterations; i++) {
      const simulator = new ExamSimulator(this.applicants, this.phases);
      let eliminated = false;
      for (const phase of this.phases) {
        const result = simulator.simulatePhase(phase, strategy.myId, strategy.decisions, {});
        if (result.eliminated) {
          eliminated = true;
          break;
        }
      }
      if (!eliminated) survivals++;
    }
    return survivals / iterations;
  }
}