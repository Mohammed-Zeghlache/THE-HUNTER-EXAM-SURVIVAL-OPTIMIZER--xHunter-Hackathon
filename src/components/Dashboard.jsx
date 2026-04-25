import React, { useState, useEffect } from 'react';

const Dashboard = ({ simulator, optimizer, anomalyDetector, myId, decisions }) => {
  const [survivalProb, setSurvivalProb] = useState(0);
  const [threats, setThreats] = useState([]);
  const [wildcards, setWildcards] = useState([]);
  const [ringers, setRingers] = useState([]);
  
  useEffect(() => {
    if (optimizer && decisions) {
      const prob = optimizer.estimateSurvivalProbability(myId, decisions);
      setSurvivalProb(prob);
      
      const threatsList = optimizer.identifyThreats(myId);
      setThreats(threatsList.slice(0, 5));
      
      if (anomalyDetector) {
        setWildcards(anomalyDetector.detectWildcards([]));
        setRingers(anomalyDetector.detectRingers([]));
      }
    }
  }, [optimizer, decisions, myId, anomalyDetector]);
  
  const styles = {
    dashboard: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
      padding: '32px',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '32px',
      textAlign: 'center',
    },
    headerH1: {
      fontSize: '40px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffaa00, #ff4444)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    },
    headerP: {
      color: '#888',
      marginTop: '8px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    },
    statCard: {
      background: '#1a1a2e',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #2a2a3e',
    },
    statLabel: {
      color: '#888',
      fontSize: '14px',
      marginBottom: '8px',
    },
    statNumber: {
      fontSize: '48px',
      fontWeight: 'bold',
    },
    progressBar: {
      background: '#333',
      borderRadius: '10px',
      height: '8px',
      marginTop: '12px',
      overflow: 'hidden',
    },
    progressFill: {
      background: '#00ff88',
      height: '100%',
      borderRadius: '10px',
      transition: 'width 0.3s',
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    },
    chartCard: {
      background: '#1a1a2e',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #2a2a3e',
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: 'white',
    },
    threatsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    threatItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      background: '#0f0f1a',
      borderRadius: '12px',
    },
    threatName: {
      fontWeight: 'bold',
      color: 'white',
    },
    threatScore: {
      fontSize: '14px',
      color: '#ff4444',
    },
    threatCircle: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: '#ff4444',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
    },
    anomaliesGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    wildcardCard: {
      background: '#ffaa0010',
      borderLeft: '3px solid #ffaa00',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '8px',
    },
    ringerCard: {
      background: '#ff444410',
      borderLeft: '3px solid #ff4444',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '8px',
    },
    anomalyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '4px',
    },
    anomalyName: {
      fontWeight: 'bold',
      color: 'white',
    },
    anomalyValue: {
      fontSize: '14px',
      color: '#ffaa00',
    },
    anomalyConfidence: {
      fontSize: '12px',
      color: '#666',
    },
    tableContainer: {
      background: '#1a1a2e',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #2a2a3e',
      marginTop: '32px',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '12px',
      color: '#888',
      borderBottom: '2px solid #2a2a3e',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #2a2a3e',
      color: '#ccc',
    },
    badgeHigh: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      background: '#ff444433',
      color: '#ff8888',
    },
    badgeNormal: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      background: '#0088ff33',
      color: '#88ccff',
    },
    badgeLow: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      background: '#00ff8833',
      color: '#88ffcc',
    },
    statusSurvived: {
      color: '#00ff88',
    },
    statusEliminated: {
      color: '#ff4444',
    },
  };
  
  const getEffortBadge = (effort) => {
    if (effort === 'high') return <span style={styles.badgeHigh}>HIGH</span>;
    if (effort === 'low') return <span style={styles.badgeLow}>LOW</span>;
    return <span style={styles.badgeNormal}>NORMAL</span>;
  };
  
  return (
    <div style={styles.dashboard}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerH1}>Hunter Exam Simulator</h1>
          <p style={styles.headerP}>Phase-by-phase survival optimization</p>
        </div>
        
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Survival Probability</div>
            <div style={{...styles.statNumber, color: '#00ff88'}}>{(survivalProb * 100).toFixed(1)}%</div>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${survivalProb * 100}%`}}></div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Final Energy</div>
            <div style={{...styles.statNumber, color: '#0088ff'}}>{simulator?.history[simulator?.history.length - 1]?.myEnergy || 0}</div>
            <div style={{...styles.statLabel, marginTop: '8px'}}>/ 100 max</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Threats Detected</div>
            <div style={{...styles.statNumber, color: '#ff4444'}}>{threats.length}</div>
            <div style={{...styles.statLabel, marginTop: '8px'}}>High-risk applicants</div>
          </div>
        </div>
        
        {/* Threats Section */}
        <div style={styles.chartsGrid}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>⚠️ Top Threats</h3>
            <div style={styles.threatsList}>
              {threats.map((threat, idx) => (
                <div key={idx} style={styles.threatItem}>
                  <div>
                    <div style={styles.threatName}>{threat.name}</div>
                    <div style={styles.threatScore}>Threat: {(threat.threatScore * 100).toFixed(1)}%</div>
                  </div>
                  <div style={{...styles.threatCircle, background: '#ff4444', width: '40px', height: '40px', fontSize: '12px'}}>
                    {Math.round(threat.threatScore * 100)}%
                  </div>
                </div>
              ))}
              {threats.length === 0 && <p style={{color: '#666'}}>No threats detected</p>}
            </div>
          </div>
          
          {/* Anomalies Section */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>🔍 Anomaly Detection</h3>
            <div>
              <div style={{marginBottom: '16px'}}>
                <div style={{color: '#ffaa00', marginBottom: '8px'}}>Wildcards:</div>
                {wildcards.slice(0, 3).map((w, idx) => (
                  <div key={idx} style={styles.wildcardCard}>
                    <div style={styles.anomalyHeader}>
                      <span style={styles.anomalyName}>{w.name}</span>
                      <span style={styles.anomalyValue}>Vol: {(w.volatility * 100).toFixed(1)}%</span>
                    </div>
                    <div style={styles.anomalyConfidence}>Confidence: {(w.confidence * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{color: '#ff4444', marginBottom: '8px'}}>Ringers:</div>
                {ringers.slice(0, 3).map((r, idx) => (
                  <div key={idx} style={styles.ringerCard}>
                    <div style={styles.anomalyHeader}>
                      <span style={styles.anomalyName}>{r.name}</span>
                      <span style={styles.anomalyValue}>+{(r.discrepancy * 100).toFixed(1)}%</span>
                    </div>
                    <div style={styles.anomalyConfidence}>Confidence: {(r.confidence * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Phase Table */}
        <div style={styles.tableContainer}>
          <h3 style={{...styles.chartTitle, marginTop: 0}}>📋 Phase Decisions</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Phase</th>
                <th style={styles.th}>Effort</th>
                <th style={styles.th}>Alliances</th>
                <th style={styles.th}>Result</th>
              </tr>
            </thead>
            <tbody>
              {simulator?.history.map((h, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>Phase {h.phaseId}</td>
                  <td style={styles.td}>{getEffortBadge(h.effort)}</td>
                  <td style={styles.td}>{h.alliances?.length || 0} allies</td>
                  <td style={styles.td}>
                    <span style={h.eliminated ? styles.statusEliminated : styles.statusSurvived}>
                      {h.eliminated ? 'Eliminated' : 'Survived'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;