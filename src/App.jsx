import React, { useState, useEffect } from 'react';
import { ExamSimulator } from './core/simulator';
import { AllianceManager } from './core/alliances';
import { SurvivalOptimizer } from './core/optimizer';
import { AnomalyDetector } from './detection/anomalies';
import Dashboard from './components/Dashboard';
import Report from './components/Report';
import applicantsData from './data/applicants.json';
import phasesData from './data/phases.json';

function App() {
  const [simulator, setSimulator] = useState(null);
  const [allianceManager, setAllianceManager] = useState(null);
  const [optimizer, setOptimizer] = useState(null);
  const [anomalyDetector, setAnomalyDetector] = useState(null);
  const [optimalPath, setOptimalPath] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [myId, setMyId] = useState(1);
  
  useEffect(() => {
    const applicants = applicantsData.applicants;
    const phases = phasesData.phases;
    
    const sim = new ExamSimulator(applicants, phases);
    const allianceMgr = new AllianceManager(applicants);
    const opt = new SurvivalOptimizer(applicants, phases, allianceMgr);
    const anomaly = new AnomalyDetector(applicants);
    
    setSimulator(sim);
    setAllianceManager(allianceMgr);
    setOptimizer(opt);
    setAnomalyDetector(anomaly);
  }, []);
  
  const runSimulation = async () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const optimal = optimizer.findOptimalPath(myId, 100);
      setOptimalPath(optimal);
      
      if (simulator && optimal) {
        for (const decision of optimal.decisions) {
          const phase = phasesData.phases.find(p => p.id === decision.phaseId);
          if (phase) {
            simulator.simulatePhase(phase, myId, [decision], {});
          }
        }
      }
      
      setIsSimulating(false);
    }, 100);
  };
  
  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
    },
    startScreen: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
    },
    startCard: {
      background: '#1a1a2e',
      borderRadius: '24px',
      padding: '40px',
      maxWidth: '500px',
      width: '90%',
      border: '1px solid #2a2a3e',
      textAlign: 'center',
    },
    startTitle: {
      fontSize: '48px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffaa00, #ff4444)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      marginBottom: '20px',
    },
    startSubtitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px',
    },
    startDescription: {
      color: '#888',
      marginBottom: '24px',
    },
    selectLabel: {
      display: 'block',
      textAlign: 'left',
      color: '#ccc',
      marginBottom: '8px',
    },
    select: {
      width: '100%',
      background: '#0f0f1a',
      color: 'white',
      border: '1px solid #2a2a3e',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    startButton: {
      width: '100%',
      background: 'linear-gradient(135deg, #ff4444, #ff6688)',
      color: 'white',
      border: 'none',
      padding: '14px',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    footerNote: {
      marginTop: '24px',
      color: '#555',
      fontSize: '12px',
    },
  };
  
  if (!optimalPath) {
    return (
      <div style={styles.startScreen}>
        <div style={styles.startCard}>
          <h1 style={styles.startTitle}>Hunter Exam</h1>
          <h2 style={styles.startSubtitle}>Survival Optimizer</h2>
          <p style={styles.startDescription}>Optimize your path to become a Hunter</p>
          
          <label style={styles.selectLabel}>Your Applicant ID</label>
          <select style={styles.select} value={myId} onChange={(e) => setMyId(parseInt(e.target.value))}>
            {applicantsData.applicants.map(a => (
              <option key={a.id} value={a.id}>{a.name} (ID: {a.id})</option>
            ))}
          </select>
          
          <button style={styles.startButton} onClick={runSimulation} disabled={isSimulating}>
            {isSimulating ? 'Simulating...' : 'Start Simulation'}
          </button>
          
          <p style={styles.footerNote}>
            Monte Carlo simulation • Alliances • Energy Management • Anomaly Detection
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Dashboard 
        simulator={simulator}
        optimizer={optimizer}
        anomalyDetector={anomalyDetector}
        myId={myId}
        decisions={optimalPath.decisions}
      />
      <Report 
        decisions={optimalPath.decisions}
        survivalProb={optimalPath.probability}
        threats={optimizer?.identifyThreats(myId) || []}
        wildcards={anomalyDetector?.detectWildcards([]) || []}
        ringers={anomalyDetector?.detectRingers([]) || []}
        finalEnergy={simulator?.history[simulator?.history.length - 1]?.myEnergy || 0}
      />
    </div>
  );
}

export default App;