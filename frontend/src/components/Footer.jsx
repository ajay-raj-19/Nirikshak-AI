import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = ({ onLoginClick, hideCTAButtons = false }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLandingScroll = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleActionClick = (actionName) => {
    if (actionName === 'explore') {
      handleLandingScroll('risk-scoring');
    } else if (actionName === 'login') {
      if (onLoginClick) onLoginClick();
      else navigate('/login');
    } else if (actionName === 'report') {
      navigate('/features/feedback');
    } else if (actionName === 'unifiedAnalysis') {
      navigate('/features/unifiedAnalysis');
    } else if (actionName === 'riskScoring') {
      navigate('/features/riskScoring');
    } else if (actionName === 'geospatial') {
      navigate('/features/geospatial');
    } else if (actionName === 'evidence') {
      navigate('/features/evidenceReview');
    } else if (actionName === 'investigation') {
      navigate('/features/highRiskProjects');
    } else if (actionName === 'about') {
      navigate('/about-us');
    } else if (actionName === 'problem') {
      handleLandingScroll('problem');
    } else if (actionName === 'process') {
      handleLandingScroll('process');
    } else if (actionName === 'team') {
      navigate('/features/team');
    } else if (actionName === 'faq') {
      navigate('/faq');
    } else if (actionName === 'privacy') {
      navigate('/privacy-policy');
    } else if (actionName === 'terms') {
      navigate('/terms-of-service');
    } else if (actionName === 'support') {
      navigate('/faq');
    } else if (actionName === 'ask') {
      navigate('/features/assistant');
      window.dispatchEvent(new CustomEvent('open-nirikshak-assistant'));
    } else if (actionName === 'contact') {
      navigate('/features/feedback');
    }
  };

  return (
    <footer
      style={{
        background: 'var(--color-bg-light)',
        borderTop: '1.5px solid #1D1E22',
        paddingTop: '5rem',
        paddingBottom: '3.5rem',
        color: 'var(--color-text-primary)',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Main 4-Column Footer Grid matching reference layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
            marginBottom: '3.5rem',
            alignItems: 'start'
          }}
        >
          {/* Column 1: Brand, Tagline & Action Pill Buttons (Left) */}
          <div style={{ maxWidth: '320px' }}>
            {/* Nirikshak AI Brand Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  color: '#1D1E22',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem'
                }}
              >
                {t('footer.brandName')}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#0A2458',
                  textTransform: 'uppercase'
                }}
              >
                {t('footer.brandSubtitle')}
              </div>
            </div>

            {/* Headline and Tagline */}
            <h3
              style={{
                fontFamily: 'var(--font-serif-primary)',
                fontSize: '1.4rem',
                lineHeight: 1.3,
                fontWeight: 600,
                color: '#1D1E22',
                marginBottom: '0.75rem'
              }}
            >
              {t('footer.headline')}
            </h3>

            <p
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--color-accent-teal-hover)',
                textTransform: 'uppercase',
                marginBottom: hideCTAButtons ? '0' : '2rem'
              }}
            >
              {t('footer.slogan')}
            </p>

            {/* Pill Action Buttons (Hidden on internal Overview view) */}
            {!hideCTAButtons && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '240px' }}>
                <button
                  onClick={() => handleActionClick('explore')}
                  className="btn-teal"
                  style={{
                    justifyContent: 'space-between',
                    padding: '0.7rem 1.4rem',
                    fontSize: '0.92rem',
                    width: '100%'
                  }}
                >
                  <span>{t('footer.actions.explore')}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => handleActionClick('login')}
                  className="btn-teal"
                  style={{
                    justifyContent: 'space-between',
                    padding: '0.7rem 1.4rem',
                    fontSize: '0.92rem',
                    width: '100%'
                  }}
                >
                  <span>{t('footer.actions.login')}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => handleActionClick('report')}
                  className="btn-teal"
                  style={{
                    justifyContent: 'space-between',
                    padding: '0.7rem 1.4rem',
                    fontSize: '0.92rem',
                    width: '100%'
                  }}
                >
                  <span>{t('footer.actions.report')}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-serif-secondary)',
                fontSize: '1.45rem',
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#1D1E22',
                paddingBottom: '0.6rem',
                borderBottom: '1px solid #1D1E22',
                marginBottom: '1.4rem'
              }}
            >
              {t('footer.sections.platform')}
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: 0, margin: 0 }}>
              <li>
                <span
                  onClick={() => handleActionClick('unifiedAnalysis')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.aiIntelligence')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('riskScoring')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.riskScoring')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('geospatial')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.geospatialMap')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('evidence')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.evidenceVerification')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('investigation')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.investigation')}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources Links */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-serif-secondary)',
                fontSize: '1.45rem',
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#1D1E22',
                paddingBottom: '0.6rem',
                borderBottom: '1px solid #1D1E22',
                marginBottom: '1.4rem'
              }}
            >
              {t('footer.sections.resources')}
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: 0, margin: 0 }}>
              <li>
                <span
                  onClick={() => handleActionClick('about')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.aboutUs')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('problem')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.theProblem')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('process')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.solutionProcess')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('team')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.meetTheTeam')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('faq')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.faqs')}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Verification Authority Badges */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-serif-secondary)',
                fontSize: '1.45rem',
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#1D1E22',
                paddingBottom: '0.6rem',
                borderBottom: '1px solid #1D1E22',
                marginBottom: '1.4rem'
              }}
            >
              {t('footer.sections.contact')}
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: 0, margin: 0, marginBottom: '1.8rem' }}>
              <li>
                <span
                  onClick={() => handleActionClick('support')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.support')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('ask')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.askNirikshakAi')}
                </span>
              </li>
              <li>
                <span
                  onClick={() => handleActionClick('contact')}
                  className="footer-nav-link"
                  style={{ cursor: 'pointer', fontSize: '0.95rem', color: '#2A2C32', fontWeight: 500 }}
                >
                  {t('footer.links.contactHelp')}
                </span>
              </li>
            </ul>

            {/* Ministry & Verified Authority Stamp Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.8rem',
                  background: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '1.5px 2px 0px #1D1E22'
                }}
              >
                <ShieldCheck size={24} color="#52B79A" />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1D1E22', lineHeight: 1.1 }}>
                    {t('footer.badges.verified')}
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#727682', letterSpacing: '0.08em' }}>
                    {t('footer.badges.compliant')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar matching reference layout */}
        <div
          style={{
            borderTop: '1px solid #1D1E22',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)'
          }}
        >
          {/* Left Copyright & Platform info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#1D1E22' }}>{t('footer.copyright')}</span>
            <span>•</span>
            <span>{t('footer.platformDesc')}</span>
          </div>

          {/* Right Legal Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <span
              onClick={() => handleActionClick('privacy')}
              className="link-underline"
              style={{ fontSize: '0.85rem', color: '#1D1E22', cursor: 'pointer' }}
            >
              {t('footer.privacyPolicy')}
            </span>
            <span
              onClick={() => handleActionClick('terms')}
              className="link-underline"
              style={{ fontSize: '0.85rem', color: '#1D1E22', cursor: 'pointer' }}
            >
              {t('footer.termsOfUse')}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-nav-link {
          display: inline-block;
          transition: transform 0.15s ease, color 0.15s ease;
        }
        .footer-nav-link:hover {
          color: var(--color-accent-teal-hover) !important;
          transform: translateX(4px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
