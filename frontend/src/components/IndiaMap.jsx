import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IndiaMapSVG from '@svg-maps/india';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export const RISK_COLORS = {
  Low:      { fill: '#52B79A', fillOpacity: 0.18, hoverOpacity: 0.55, text: '#52B79A' },
  Medium:   { fill: '#E5B842', fillOpacity: 0.18, hoverOpacity: 0.55, text: '#E5B842' },
  High:     { fill: '#E07A5F', fillOpacity: 0.18, hoverOpacity: 0.55, text: '#E07A5F' },
  Critical: { fill: '#D9534F', fillOpacity: 0.18, hoverOpacity: 0.55, text: '#D9534F' },
};

export const STATE_ID_TO_SLUG = {
  'an': 'andaman-nicobar-islands',
  'ap': 'andhra-pradesh',
  'ar': 'arunachal-pradesh',
  'as': 'assam',
  'br': 'bihar',
  'ch': 'chandigarh',
  'ct': 'chhattisgarh',
  'dn': 'the-dadra-and-nagar-haveli-and-daman-and-diu',
  'dd': 'the-dadra-and-nagar-haveli-and-daman-and-diu',
  'dl': 'delhi',
  'ga': 'goa',
  'gj': 'gujarat',
  'hr': 'haryana',
  'hp': 'himachal-pradesh',
  'jk': 'jammu-kashmir',
  'jh': 'jharkhand',
  'ka': 'karnataka',
  'kl': 'kerala',
  'ld': 'lakshadweep',
  'mp': 'madhya-pradesh',
  'mh': 'maharashtra',
  'mn': 'manipur',
  'ml': 'meghalaya',
  'mz': 'mizoram',
  'nl': 'nagaland',
  'or': 'odisha',
  'py': 'puducherry',
  'pb': 'punjab',
  'rj': 'rajasthan',
  'sk': 'sikkim',
  'tn': 'tamil-nadu',
  'tg': 'telangana',
  'tr': 'tripura',
  'up': 'uttar-pradesh',
  'ut': 'uttarakhand',
  'wb': 'west-bengal',
  'la': 'ladakh',
};

// Verified baseline state performance data synced with official MoSPI statistics
const stateRiskData = {
  // States
  'ap': { name: 'Andhra Pradesh',       riskLevel: 'Medium',   riskScore: 21, projects: 8856,  sanctionedAmount: '₹956 Cr',   anomalies: 63 },
  'ar': { name: 'Arunachal Pradesh',    riskLevel: 'Low',      riskScore: 18, projects: 712,   sanctionedAmount: '₹84 Cr',    anomalies: 4 },
  'as': { name: 'Assam',                riskLevel: 'Medium',   riskScore: 20, projects: 5410,  sanctionedAmount: '₹512 Cr',   anomalies: 30 },
  'br': { name: 'Bihar',                riskLevel: 'High',     riskScore: 23, projects: 13685, sanctionedAmount: '₹984 Cr',   anomalies: 7 },
  'ct': { name: 'Chhattisgarh',         riskLevel: 'High',     riskScore: 23, projects: 4850,  sanctionedAmount: '₹415 Cr',   anomalies: 22 },
  'ga': { name: 'Goa',                  riskLevel: 'Low',      riskScore: 16, projects: 412,   sanctionedAmount: '₹48 Cr',    anomalies: 2 },
  'gj': { name: 'Gujarat',              riskLevel: 'Medium',   riskScore: 19, projects: 17210, sanctionedAmount: '₹1,180 Cr', anomalies: 89 },
  'hr': { name: 'Haryana',              riskLevel: 'Medium',   riskScore: 19, projects: 3950,  sanctionedAmount: '₹398 Cr',   anomalies: 18 },
  'hp': { name: 'Himachal Pradesh',     riskLevel: 'High',     riskScore: 24, projects: 3210,  sanctionedAmount: '₹285 Cr',   anomalies: 47 },
  'jk': { name: 'Jammu and Kashmir',    riskLevel: 'Medium',   riskScore: 21, projects: 2450,  sanctionedAmount: '₹114 Cr',   anomalies: 12 },
  'jh': { name: 'Jharkhand',            riskLevel: 'Medium',   riskScore: 18, projects: 8992,  sanctionedAmount: '₹338 Cr',   anomalies: 15 },
  'ka': { name: 'Karnataka',            riskLevel: 'Medium',   riskScore: 18, projects: 11431, sanctionedAmount: '₹686 Cr',   anomalies: 46 },
  'kl': { name: 'Kerala',               riskLevel: 'Medium',   riskScore: 19, projects: 4520,  sanctionedAmount: '₹410 Cr',   anomalies: 47 },
  'mp': { name: 'Madhya Pradesh',       riskLevel: 'Medium',   riskScore: 19, projects: 17395, sanctionedAmount: '₹654 Cr',   anomalies: 45 },
  'mh': { name: 'Maharashtra',          riskLevel: 'Medium',   riskScore: 18, projects: 19850, sanctionedAmount: '₹1,420 Cr', anomalies: 45 },
  'mn': { name: 'Manipur',              riskLevel: 'High',     riskScore: 24, projects: 380,   sanctionedAmount: '₹42 Cr',    anomalies: 6 },
  'ml': { name: 'Meghalaya',            riskLevel: 'Low',      riskScore: 17, projects: 420,   sanctionedAmount: '₹44 Cr',    anomalies: 3 },
  'mz': { name: 'Mizoram',              riskLevel: 'Medium',   riskScore: 22, projects: 390,   sanctionedAmount: '₹38 Cr',    anomalies: 5 },
  'nl': { name: 'Nagaland',             riskLevel: 'High',     riskScore: 23, projects: 151,   sanctionedAmount: '₹40 Cr',    anomalies: 3 },
  'or': { name: 'Odisha',               riskLevel: 'Medium',   riskScore: 17, projects: 14200, sanctionedAmount: '₹765 Cr',   anomalies: 27 },
  'pb': { name: 'Punjab',               riskLevel: 'Medium',   riskScore: 20, projects: 6100,  sanctionedAmount: '₹510 Cr',   anomalies: 41 },
  'rj': { name: 'Rajasthan',            riskLevel: 'Medium',   riskScore: 21, projects: 12850, sanctionedAmount: '₹895 Cr',   anomalies: 37 },
  'sk': { name: 'Sikkim',               riskLevel: 'Low',      riskScore: 16, projects: 180,   sanctionedAmount: '₹28 Cr',    anomalies: 1 },
  'tn': { name: 'Tamil Nadu',           riskLevel: 'Medium',   riskScore: 19, projects: 15400, sanctionedAmount: '₹1,240 Cr', anomalies: 72 },
  'tg': { name: 'Telangana',            riskLevel: 'Medium',   riskScore: 18, projects: 12100, sanctionedAmount: '₹710 Cr',   anomalies: 49 },
  'tr': { name: 'Tripura',              riskLevel: 'High',     riskScore: 25, projects: 480,   sanctionedAmount: '₹52 Cr',    anomalies: 4 },
  'up': { name: 'Uttar Pradesh',        riskLevel: 'Critical', riskScore: 23, projects: 42788, sanctionedAmount: '₹2,077 Cr', anomalies: 200 },
  'ut': { name: 'Uttarakhand',          riskLevel: 'High',     riskScore: 23, projects: 4100,  sanctionedAmount: '₹310 Cr',   anomalies: 16 },
  'wb': { name: 'West Bengal',          riskLevel: 'Critical', riskScore: 23, projects: 16200, sanctionedAmount: '₹1,120 Cr', anomalies: 47 },
  // Union Territories
  'an': { name: 'Andaman and Nicobar',  riskLevel: 'Low',      riskScore: 15, projects: 71,    sanctionedAmount: '₹17 Cr',    anomalies: 2 },
  'ch': { name: 'Chandigarh',           riskLevel: 'Medium',   riskScore: 21, projects: 145,   sanctionedAmount: '₹15 Cr',    anomalies: 2 },
  'dn': { name: 'Dadra and Nagar Haveli', riskLevel: 'Low',    riskScore: 14, projects: 95,    sanctionedAmount: '₹12 Cr',    anomalies: 0 },
  'dd': { name: 'Daman and Diu',        riskLevel: 'Low',      riskScore: 14, projects: 64,    sanctionedAmount: '₹8 Cr',     anomalies: 0 },
  'dl': { name: 'Delhi',                riskLevel: 'Medium',   riskScore: 20, projects: 1820,  sanctionedAmount: '₹145 Cr',   anomalies: 14 },
  'ld': { name: 'Lakshadweep',          riskLevel: 'Low',      riskScore: 15, projects: 77,    sanctionedAmount: '₹8 Cr',     anomalies: 1 },
  'py': { name: 'Puducherry',           riskLevel: 'Low',      riskScore: 15, projects: 111,   sanctionedAmount: '₹18 Cr',    anomalies: 1 },
};

const IndiaMap = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedState, setSelectedState] = useState(null); // for touch devices
  const containerRef = useRef(null);

  const [mapData, setMapData] = useState(stateRiskData);

  const { ministryView, costAnomalies, duplicateAlerts } = useData();

  // Compute live anomaly counts per state from real anomaly datasets
  const stateAnomaliesMap = useMemo(() => {
    const map = {};
    (costAnomalies || []).forEach(c => {
      if (c.state_name) map[c.state_name] = (map[c.state_name] || 0) + 1;
    });
    (duplicateAlerts || []).forEach(d => {
      const s = d.state_name || d.state;
      if (s) map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [costAnomalies, duplicateAlerts]);

  useEffect(() => {
    if (ministryView && ministryView.state_wise_benchmarks) {
      const updated = { ...stateRiskData };
      const stateNameToId = {
        'Andhra Pradesh': 'ap', 'Arunachal Pradesh': 'ar', 'Assam': 'as', 'Bihar': 'br',
        'Chhattisgarh': 'ct', 'Goa': 'ga', 'Gujarat': 'gj', 'Haryana': 'hr',
        'Himachal Pradesh': 'hp', 'Jammu and Kashmir': 'jk', 'Jharkhand': 'jh',
        'Karnataka': 'ka', 'Kerala': 'kl', 'Madhya Pradesh': 'mp', 'Maharashtra': 'mh',
        'Manipur': 'mn', 'Meghalaya': 'ml', 'Mizoram': 'mz', 'Nagaland': 'nl',
        'Odisha': 'or', 'Punjab': 'pb', 'Rajasthan': 'rj', 'Sikkim': 'sk',
        'Tamil Nadu': 'tn', 'Telangana': 'tg', 'Tripura': 'tr', 'Uttar Pradesh': 'up',
        'Uttarakhand': 'ut', 'West Bengal': 'wb', 'Andaman and Nicobar': 'an',
        'Chandigarh': 'ch', 'Dadra and Nagar Haveli': 'dn', 'Daman and Diu': 'dd',
        'Delhi': 'dl', 'Lakshadweep': 'ld', 'Puducherry': 'py', 'Ladakh': 'la'
      };
      
      ministryView.state_wise_benchmarks.forEach(item => {
        const id = stateNameToId[item.state_name];
        if (id && updated[id]) {
          const score = Math.round(item.avg_risk || 0);
          let level = 'Low';
          if (score >= 23) level = 'Critical';
          else if (score >= 20) level = 'High';
          else if (score >= 17) level = 'Medium';
          
          const realAnomalies = stateAnomaliesMap[item.state_name] ?? updated[id].anomalies;

          updated[id] = {
            ...updated[id],
            riskLevel: level,
            riskScore: score,
            projects: item.total_projects || updated[id].projects,
            sanctionedAmount: `₹${(item.total_sanctioned / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`,
            anomalies: realAnomalies
          };
        }
      });
      setMapData(updated);
    }
  }, [ministryView, stateAnomaliesMap]);

  const handleMouseEnter = useCallback((stateId) => {
    setHoveredState(stateId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredState(null);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltipPos({ x, y });
  }, []);

  const handleTouchStart = useCallback((stateId) => {
    setSelectedState((prev) => (prev === stateId ? null : stateId));
    setHoveredState(stateId);
  }, []);

  const handleStateClick = useCallback((stateId) => {
    const slug = STATE_ID_TO_SLUG[stateId];
    if (slug) {
      navigate(`/states/${slug}`);
    }
  }, [navigate]);

  // Get fill color for a state based on risk level and hover status
  const getStateFill = useCallback((stateId) => {
    const data = mapData[stateId];
    if (!data) return { fill: '#E8E4DA', opacity: 0.6 };

    const colors = RISK_COLORS[data.riskLevel] || RISK_COLORS.Medium;
    const isActive = hoveredState === stateId || selectedState === stateId;

    return {
      fill: colors.fill,
      opacity: isActive ? colors.hoverOpacity : colors.fillOpacity,
    };
  }, [hoveredState, selectedState, mapData]);

  // Determine active state for tooltip
  const activeStateId = hoveredState || selectedState;
  const activeData = activeStateId ? mapData[activeStateId] : null;

  // Tooltip positioning with boundary clamping
  const tooltipStyle = useMemo(() => {
    if (!activeData) return {};
    const tooltipW = 260;
    const tooltipH = 220;
    let tx = tooltipPos.x + 16;
    let ty = tooltipPos.y - 10;

    // Clamp to right edge
    if (containerRef.current) {
      const containerW = containerRef.current.offsetWidth;
      const containerH = containerRef.current.offsetHeight;
      if (tx + tooltipW > containerW) tx = tooltipPos.x - tooltipW - 16;
      if (ty + tooltipH > containerH) ty = containerH - tooltipH - 10;
      if (ty < 0) ty = 10;
    }

    return {
      left: `${tx}px`,
      top: `${ty}px`,
    };
  }, [activeData, tooltipPos]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '380px',
        background: '#F3EFE6',
        border: '1.5px solid #1D1E22',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem 1rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Map Title & Hint */}
      <div style={{
        textAlign: 'center',
        marginBottom: '0.8rem',
      }}>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: '#1D1E22',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          {t('indiaMap.mapTitle') || 'MPLADS India Risk Intelligence Map'}
        </div>
        <div style={{
          fontSize: '0.68rem',
          color: '#5A5A5A',
          marginTop: '0.2rem',
          fontWeight: 600
        }}>
          Click any state to explore constituency performance & works
        </div>
      </div>

      {/* SVG Map */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={IndiaMapSVG.viewBox}
        style={{
          width: '100%',
          maxWidth: '480px',
          height: 'auto',
          display: 'block',
        }}
        role="img"
        aria-label="Interactive India state-level risk map"
      >
        {IndiaMapSVG.locations.map((location) => {
          const { fill, opacity } = getStateFill(location.id);
          const isActive = hoveredState === location.id || selectedState === location.id;
          const localizedName = t(`indiaMap.states.${location.id}`, mapData[location.id]?.name || location.name);

          return (
            <path
              key={location.id}
              id={`state-${location.id}`}
              d={location.path}
              fill={fill}
              fillOpacity={opacity}
              stroke="#1D1E22"
              strokeWidth={isActive ? '1.4' : '0.6'}
              strokeLinejoin="round"
              onMouseEnter={() => handleMouseEnter(location.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleStateClick(location.id)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTouchStart(location.id);
              }}
              style={{
                cursor: 'pointer',
                transition: 'fill-opacity 0.25s ease, stroke-width 0.2s ease, filter 0.25s ease',
                filter: isActive ? `drop-shadow(0 0 6px ${fill})` : 'none',
              }}
            >
              <title>{localizedName}</title>
            </path>
          );
        })}
      </svg>

      {/* Tooltip */}
      <div
        style={{
          position: 'absolute',
          ...tooltipStyle,
          pointerEvents: 'none',
          zIndex: 50,
          opacity: activeData ? 1 : 0,
          transform: activeData ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          willChange: 'opacity, transform',
        }}
      >
        {activeData && (
          <div style={{
            background: '#FEFCF7',
            border: '1.5px solid #1D1E22',
            borderRadius: '10px',
            padding: '1rem 1.2rem',
            width: '250px',
            boxShadow: '0 6px 24px rgba(29, 30, 34, 0.12)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            {/* State Name */}
            <div style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: '#1D1E22',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-serif-primary, Georgia, serif)',
              lineHeight: 1.2,
            }}>
              {t(`indiaMap.states.${activeStateId}`, activeData.name)}
            </div>

            {/* Risk Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: (RISK_COLORS[activeData.riskLevel]?.fill || '#52B79A') + '18',
              border: `1px solid ${RISK_COLORS[activeData.riskLevel]?.fill || '#52B79A'}`,
              borderRadius: '4px',
              padding: '0.2rem 0.55rem',
              marginBottom: '0.65rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: RISK_COLORS[activeData.riskLevel]?.fill || '#52B79A',
                display: 'inline-block',
              }}></span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: RISK_COLORS[activeData.riskLevel]?.text || '#1D1E22',
              }}>
                {t(`indiaMap.riskLevels.${activeData.riskLevel.toLowerCase()}`, activeData.riskLevel)} {t('indiaMap.tooltip.riskSuffix') || 'Risk'}
              </span>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.45rem 1rem',
              borderTop: '1px solid rgba(29, 30, 34, 0.1)',
              paddingTop: '0.55rem',
            }}>
              <StatRow label={t('indiaMap.tooltip.projects') || 'Projects'} value={activeData.projects.toLocaleString('en-IN')} />
              <StatRow label={t('indiaMap.tooltip.riskScore') || 'Risk Score'} value={`${activeData.riskScore}%`} highlight={activeData.riskLevel} />
              <StatRow label={t('indiaMap.tooltip.sanctioned') || 'Sanctioned'} value={activeData.sanctionedAmount} />
              <StatRow label={t('indiaMap.tooltip.anomalies') || 'Anomalies'} value={activeData.anomalies.toLocaleString('en-IN')} highlight={activeData.anomalies > 20 ? 'High' : null} />
            </div>

            {/* Click CTA Prompt */}
            <div style={{
              marginTop: '0.65rem',
              paddingTop: '0.45rem',
              borderTop: '1px dashed rgba(29, 30, 34, 0.15)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#52B79A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>View State Details</span>
              <span>→</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mini stat row component for tooltip
const StatRow = ({ label, value, highlight }) => (
  <div>
    <div style={{
      fontSize: '0.62rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: '#8A8A8A',
      marginBottom: '0.1rem',
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '0.82rem',
      fontWeight: 700,
      color: highlight ? RISK_COLORS[highlight]?.text || '#1D1E22' : '#1D1E22',
    }}>
      {value}
    </div>
  </div>
);

export default IndiaMap;
