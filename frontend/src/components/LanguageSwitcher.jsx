import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = ({ isMobile: _isMobile = false, className = "btn-teal", style: customStyle = {} }) => {
  const { language, toggleLanguage } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const isEn = language === 'en';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      aria-label={isEn ? "Switch language to Hindi" : "Switch language to English"}
      title={isEn ? "Switch to Hindi (हिंदी)" : "Switch to English (ENGLISH)"}
      style={{
        padding: '0.65rem 1rem',
        fontSize: '0.85rem',
        fontWeight: 700,
        width: '126px',
        minWidth: '126px',
        maxWidth: '126px',
        height: '42px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-accent-teal)',
        color: '#1D1E22',
        border: '1.5px solid #1D1E22',
        boxShadow: '2px 2.5px 0px #1D1E22',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        outline: 'none',
        lineHeight: 1.2,
        ...customStyle
      }}
    >
      {/* Globe Icon */}
      <Globe size={16} strokeWidth={2.2} color="currentColor" style={{ flexShrink: 0, transition: 'color 0.2s ease' }} />

      {/* Single Fixed-Size Text Viewport with Smooth Roll/Fade Animation */}
      <div
        style={{
          position: 'relative',
          height: '1.25em',
          width: '68px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Currently Selected Language */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            transform: isHovered ? 'translateY(-135%)' : 'translateY(0%)',
            opacity: isHovered ? 0 : 1,
            transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease, color 0.2s ease',
            color: 'currentColor',
            fontWeight: 700,
            fontSize: isEn ? '0.82rem' : '0.88rem',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            letterSpacing: isEn ? '0.04em' : 'normal'
          }}
        >
          {isEn ? 'ENGLISH' : 'हिंदी'}
        </span>

        {/* Alternative Language Revealed on Hover */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            transform: isHovered ? 'translateY(0%)' : 'translateY(135%)',
            opacity: isHovered ? 1 : 0,
            transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease, color 0.2s ease',
            color: 'currentColor',
            fontWeight: 700,
            fontSize: isEn ? '0.88rem' : '0.82rem',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            letterSpacing: isEn ? 'normal' : '0.04em'
          }}
        >
          {isEn ? 'हिंदी' : 'ENGLISH'}
        </span>
      </div>
    </button>
  );
};

export default LanguageSwitcher;



