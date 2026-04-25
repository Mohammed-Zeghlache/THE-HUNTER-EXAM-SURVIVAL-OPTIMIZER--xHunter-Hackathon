import React from 'react';

const Report = ({ decisions, survivalProb, threats, wildcards, ringers, finalEnergy }) => {
  
  const generateTextReport = () => {
    let report = "HUNTER EXAM SURVIVAL OPTIMIZER - FINAL REPORT\n";
    report += "=".repeat(60) + "\n\n";
    
    report += "OPTIMAL SURVIVAL PATH:\n";
    report += "-".repeat(40) + "\n";
    decisions.forEach((d, idx) => {
      report += `Phase ${d.phaseId}: ${d.effort.toUpperCase()} effort, ${d.alliances.length} alliance(s)\n`;
      if (d.alliances.length > 0) {
        report += `  └─ Allied with: ${d.alliances.join(', ')}\n`;
      }
    });
    
    report += `\nFINAL STATISTICS:\n`;
    report += `- Survival Probability: ${(survivalProb * 100).toFixed(1)}%\n`;
    report += `- Final Energy: ${finalEnergy}/100\n`;
    
    report += `\nCRITICAL THREATS IDENTIFIED:\n`;
    threats.slice(0, 3).forEach(t => {
      report += `- ${t.name}: Threat Score ${(t.threatScore * 100).toFixed(1)}%\n`;
    });
    
    report += `\nANOMALY DETECTION:\n`;
    report += `- Wildcards detected: ${wildcards.length}\n`;
    report += `- Ringers detected: ${ringers.length}\n`;
    
    if (wildcards.length > 0) {
      report += `\nTop Wildcards:\n`;
      wildcards.slice(0, 2).forEach(w => {
        report += `  • ${w.name} (volatility: ${(w.volatility * 100).toFixed(1)}%)\n`;
      });
    }
    
    if (ringers.length > 0) {
      report += `\nTop Ringers:\n`;
      ringers.slice(0, 2).forEach(r => {
        report += `  • ${r.name} (${(r.discrepancy * 100).toFixed(1)}% stronger than shown)\n`;
      });
    }
    
    report += `\nSTRATEGY EXPLANATION:\n`;
    report += `- Biggest Risk: Conserving energy too early could lead to elimination in high-difficulty phases\n`;
    report += `- Key Insight: Alliances provide significant bonuses but require trust verification\n`;
    report += `- Surprise Element: Wildcard applicants showed performance variance of up to 30%\n`;
    report += `- Energy Strategy: Used ${decisions.filter(d => d.effort === 'high').length} high-effort phases, ${decisions.filter(d => d.effort === 'low').length} low-effort phases\n`;
    
    return report;
  };
  
  const downloadReport = () => {
    const report = generateTextReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survival_path_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const styles = {
    section: {
      padding: '32px',
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
    },
    container: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    headerH2: {
      fontSize: '32px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffaa00, #ff4444)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      marginBottom: '8px',
    },
    headerP: {
      color: '#888',
    },
    previewBox: {
      background: '#0f0f1a',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      border: '1px solid #2a2a3e',
      maxHeight: '400px',
      overflow: 'auto',
    },
    previewPre: {
      fontFamily: "'Courier New', 'Fira Code', monospace",
      fontSize: '13px',
      color: '#ccc',
      whiteSpace: 'pre-wrap',
      lineHeight: 1.5,
    },
    downloadBtn: {
      width: '100%',
      background: 'linear-gradient(135deg, #00ff88, #00cc66)',
      color: '#0a0a0a',
      border: 'none',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    footer: {
      textAlign: 'center',
      marginTop: '24px',
      color: '#555',
      fontSize: '12px',
    },
  };
  
  return (
    <div style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.headerH2}>Survival Report</h2>
          <p style={styles.headerP}>Export your optimized path</p>
        </div>
        
        <div style={styles.previewBox}>
          <pre style={styles.previewPre}>{generateTextReport()}</pre>
        </div>
        
        <button 
          style={styles.downloadBtn}
          onClick={downloadReport}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          📥 Download Report (.txt)
        </button>
        
        <div style={styles.footer}>
          <p>Report includes: optimal decisions, risk assessment, anomaly detection, and strategy explanation</p>
        </div>
      </div>
    </div>
  );
};

export default Report;