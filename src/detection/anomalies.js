import _ from 'lodash';

export class AnomalyDetector {
  constructor(applicants) {
    this.applicants = applicants;
    this.performanceHistory = {};
    this.initializeHistory();
  }
  
  initializeHistory() {
    for (const applicant of this.applicants) {
      this.performanceHistory[applicant.id] = [];
    }
  }
  
  detectWildcards(phaseResults) {
    const wildcardCandidates = [];
    
    for (const applicant of this.applicants) {
      const history = this.performanceHistory[applicant.id];
      if (history.length < 2) continue;
      
      const variance = this.calculateVariance(history);
      const volatility = variance / (_.mean(history) || 1);
      
      if (volatility > 0.3) {
        wildcardCandidates.push({
          ...applicant,
          volatility,
          confidence: Math.min(0.95, volatility * 1.5)
        });
      }
    }
    
    return _.orderBy(wildcardCandidates, ['volatility'], ['desc']);
  }
  
  detectRingers(phaseResults) {
    const ringerCandidates = [];
    
    for (const applicant of this.applicants) {
      const history = this.performanceHistory[applicant.id];
      if (history.length === 0) continue;
      
      const expectedPerformance = this.calculateExpectedPerformance(applicant);
      const actualPerformance = _.mean(history);
      const discrepancy = (actualPerformance - expectedPerformance) / expectedPerformance;
      
      if (discrepancy > 0.2) {
        ringerCandidates.push({
          ...applicant,
          discrepancy,
          estimatedTrueStats: this.estimateTrueStats(applicant, actualPerformance),
          confidence: Math.min(0.9, discrepancy * 2)
        });
      }
    }
    
    return _.orderBy(ringerCandidates, ['discrepancy'], ['desc']);
  }
  
  calculateVariance(values) {
    const mean = _.mean(values);
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return _.mean(squaredDiffs);
  }
  
  calculateExpectedPerformance(applicant) {
    return (applicant.speed + applicant.strength + applicant.intelligence + 
            applicant.nenControl + applicant.teamwork) / 5;
  }
  
  estimateTrueStats(applicant, actualPerformance) {
    const currentAvg = this.calculateExpectedPerformance(applicant);
    const multiplier = actualPerformance / currentAvg;
    
    return {
      speed: Math.min(100, applicant.speed * multiplier),
      strength: Math.min(100, applicant.strength * multiplier),
      intelligence: Math.min(100, applicant.intelligence * multiplier),
      nenControl: Math.min(100, applicant.nenControl * multiplier),
      teamwork: applicant.teamwork * (1 - (multiplier - 1) * 0.5)
    };
  }
  
  updatePerformance(phaseId, results) {
    for (const result of results) {
      if (this.performanceHistory[result.applicantId]) {
        this.performanceHistory[result.applicantId].push(result.score || 50);
        
        if (this.performanceHistory[result.applicantId].length > 10) {
          this.performanceHistory[result.applicantId].shift();
        }
      }
    }
  }
  
  getRiskAssessment(myId) {
    const threats = [];
    
    for (const applicant of this.applicants) {
      if (applicant.id === myId) continue;
      
      const isPotentialWildcard = this.performanceHistory[applicant.id]?.some((v, i, arr) => 
        i > 0 && Math.abs(v - arr[i-1]) > 25
      ) || false;
      
      const isPotentialRinger = (this.performanceHistory[applicant.id]?.length > 0 &&
        _.mean(this.performanceHistory[applicant.id]) > this.calculateExpectedPerformance(applicant) * 1.15) || false;
      
      if (isPotentialWildcard || isPotentialRinger) {
        threats.push({
          ...applicant,
          riskType: isPotentialWildcard ? 'wildcard' : 'ringer',
          riskLevel: isPotentialWildcard ? 
            Math.min(1, this.calculateVariance(this.performanceHistory[applicant.id]) / 50) : 
            Math.min(1, (_.mean(this.performanceHistory[applicant.id]) / this.calculateExpectedPerformance(applicant) - 1) * 2)
        });
      }
    }
    
    return _.orderBy(threats, ['riskLevel'], ['desc']);
  }
}