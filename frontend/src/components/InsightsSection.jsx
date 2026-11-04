import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import IndiaMap from './IndiaMap';

const InsightsSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { districtAuthorityView } = useData();

  // Dynamic district risk cards automatically synced with live District Authority registry
  const districtRiskData = useMemo(() => {
    const defaultDistricts = [
      {
        id: 1,
        matchKey: 'ALIGARH',
        district: t('geospatial.districtCards.0.district') || 'Aligarh District',
        state: t('geospatial.districtCards.0.state') || 'Uttar Pradesh',
        stateSlug: 'uttar-pradesh',
        totalProjects: 36665,
        sanctionedAmountText: '₹18.3 Cr Sanctioned',
        riskCategory: 'Critical',
        anomalyCount: 4363,
        color: '#D9534F'
      },
      {
        id: 2,
        matchKey: 'BETUL',
        district: t('geospatial.districtCards.1.district') || 'Betul (ST) District',
        state: t('geospatial.districtCards.1.state') || 'Madhya Pradesh',
        stateSlug: 'madhya-pradesh',
        totalProjects: 15906,
        sanctionedAmountText: '₹26.2 Cr Sanctioned',
        riskCategory: 'High',
        anomalyCount: 538,
        color: '#E07A5F'
      },
      {
        id: 3,
        matchKey: 'ARARIA',
        district: t('geospatial.districtCards.2.district') || 'Araria District',
        state: t('geospatial.districtCards.2.state') || 'Bihar',
        stateSlug: 'bihar',
        totalProjects: 11787,
        sanctionedAmountText: '₹24.2 Cr Sanctioned',
        riskCategory: 'Medium',
        anomalyCount: 282,
        color: '#E5B842'
      },
      {
        id: 4,
        matchKey: 'BANGALORE',
        district: t('geospatial.districtCards.3.district') || 'Bangalore Rural',
        state: t('geospatial.districtCards.3.state') || 'Karnataka',
        stateSlug: 'karnataka',
        totalProjects: 10077,
        sanctionedAmountText: '₹23.3 Cr Sanctioned',
        riskCategory: 'Low',
        anomalyCount: 495,
        color: '#52B79A'
      }
    ];

    if (Array.isArray(districtAuthorityView) && districtAuthorityView.length > 0) {
      return defaultDistricts.map(item => {
        const live = districtAuthorityView.find(d => 
          d.constituency_name && d.constituency_name.toUpperCase().includes(item.matchKey)
        );
        if (!live) {
          return {
            ...item,
            totalProjectsText: `${item.totalProjects.toLocaleString('en-IN')} Projects`,
            anomalyCountText: `${item.anomalyCount.toLocaleString('en-IN')} High Risk Alerts`
          };
        }

        const liveProjects = live.total_projects || item.totalProjects;
        const liveAnomalies = live.high_risk_count ?? item.anomalyCount;
        let category = item.riskCategory;
        if (live.avg_risk >= 23) category = 'Critical';
        else if (live.avg_risk >= 20) category = 'High';
        else if (live.avg_risk >= 17) category = 'Medium';
        else category = 'Low';

        return {
          ...item,
          totalProjects: liveProjects,
          totalProjectsText: `${liveProjects.toLocaleString('en-IN')} Projects`,
          anomalyCount: liveAnomalies,
          anomalyCountText: `${liveAnomalies.toLocaleString('en-IN')} High Risk Alerts`,
          riskCategory: category
        };
      });
    }

    return defaultDistricts.map(i => ({
      ...i,
      totalProjectsText: `${i.totalProjects.toLocaleString('en-IN')} Projects`,
      anomalyCountText: `${i.anomalyCount.toLocaleString('en-IN')} High Risk Alerts`
    }));
  }, [districtAuthorityView, t]);

  return (
    <section
      id="geospatial"
      className="section-padding"
      style={{
        background: 'var(--color-bg-light)',
        borderTop: '1px solid var(--color-border-subtle)'
      }}
    >
      <div className="container">

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3.5rem auto' }}>
          <span className="eyebrow">{t('geospatial.eyebrow')}</span>
          <h2 style={{ fontFamily: 'var(--font-serif-primary)', marginBottom: '1rem' }}>
            {t('geospatial.heading')} <span style={{ color: 'var(--color-accent-teal-hover)' }}>{t('geospatial.headingHighlight')}</span>
          </h2>
          <p className="lead">
            {t('geospatial.lead')}
          </p>
        </div>

        {/* Geospatial Risk Legend & Controls Bar */}
        <div
          style={{
            background: 'var(--color-bg-card-sand)',
            border: '1.5px solid #1D1E22',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem 2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#1D1E22' }}>
            <Layers size={18} />
            <span>{t('geospatial.legendTitle')}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#52B79A', border: '1px solid #1D1E22' }}></span>
              <span>{t('geospatial.legendLow')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#E5B842', border: '1px solid #1D1E22' }}></span>
              <span>{t('geospatial.legendMedium')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#E07A5F', border: '1px solid #1D1E22' }}></span>
              <span>{t('geospatial.legendHigh')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#D9534F', border: '1px solid #1D1E22' }}></span>
              <span>{t('geospatial.legendCritical')}</span>
            </div>
          </div>
        </div>

        {/* Visual Map & District Risk Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}
        >
          {/* Interactive India State-Level Risk Map */}
          <IndiaMap />

          {/* District Risk Overview Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {districtRiskData.map((d) => (
              <div
                key={d.id}
                className="card-light"
                style={{
                  padding: '1.4rem 1.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onClick={() => {
                  if (d.stateSlug) {
                    navigate(`/states/${d.stateSlug}`);
                  } else {
                    navigate('/features/geospatial');
                  }
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }}></span>
                    <h3 style={{ fontFamily: 'var(--font-serif-primary)', fontSize: '1.2rem', color: '#1D1E22' }}>
                      {d.district}
                    </h3>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#5A5A5A' }}>
                      ({d.state})
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#5A5A5A' }}>
                    {d.totalProjectsText} • {d.sanctionedAmountText}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: d.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {d.riskCategory} {t('common.risk') || 'Risk'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#1D1E22', fontWeight: 600 }}>
                    {d.anomalyCountText}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#52B79A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                    <span>View State</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default InsightsSection;
