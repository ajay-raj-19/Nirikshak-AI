import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, Cpu, Layers,
  ArrowLeft, Compass, Scale
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../Header';
import Footer from '../Footer';

const AboutUsView = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const riskPillars = [
    {
      no: '01',
      title: isHi ? 'वित्तीय व्यय विसंगति' : 'Financial Burn Anomaly',
      desc: isHi
        ? 'संवितरण गति, असामान्य व्यय स्पाइक्स, और अंतिम समय में फंड डंपिंग की पहचान।'
        : 'Detects irregular disbursement surges, fiscal year-end fund dumping, and milestone-unaligned releases.'
    },
    {
      no: '02',
      title: isHi ? 'भौतिक बनाम वित्तीय अंतर' : 'Physical vs Financial Gap',
      desc: isHi
        ? 'कागजी फंड खर्च और जमीन पर दर्ज वास्तविक निर्माण प्रगति के बीच बेमेल।'
        : 'Flags projects where 80%+ funds are disbursed while ground physical progress remains under 30%.'
    },
    {
      no: '03',
      title: isHi ? 'ठेकेदार एवं कार्टेल क्लस्टरिंग' : 'Contractor & Cartel Clustering',
      desc: isHi
        ? 'संबंधित एजेंसियों, रिपीट वेंडरों और एकाधिकार कार्य आवंटन का नेटवर्क विश्लेषण।'
        : 'Uncovers vendor monopolies, shared phone/bank networks, and repetitive non-competitive contract awards.'
    },
    {
      no: '04',
      title: isHi ? 'भू-स्थानिक और कार्य दोहराव' : 'Geospatial & Asset Duplication',
      desc: isHi
        ? 'एक ही स्थान पर समान कार्य विवरण के साथ डुप्लिकेट कार्यों की पहचान।'
        : 'Flags identical work descriptions sanctioned at nearby coordinates across different tenures.'
    },
    {
      no: '05',
      title: isHi ? 'समय-सीमा व रुकावट विश्लेषण' : 'Timeline & Stagnation Tracking',
      desc: isHi
        ? 'अनुमोदन के बाद महीनों तक बिना कार्य शुरू हुए फंड निष्क्रियता की निगरानी।'
        : 'Monitors chronic delays, stalled infrastructure, and works with no UC progress for over 180 days.'
    },
    {
      no: '06',
      title: isHi ? 'स्वीकृति विचलन एवं विभाजन' : 'Sanction Splitting & Limit Violations',
      desc: isHi
        ? 'टेंडर सीमाओं से बचने के लिए बड़े प्रोजेक्ट्स को छोटे टुकड़ों में बांटने की पहचान।'
        : 'Detects artificial splitting of work sanctions to bypass mandatory administrative tender thresholds.'
    },
    {
      no: '07',
      title: isHi ? 'साक्ष्य व प्रमाणपत्र अनुपालन' : 'Evidence & UC Verification',
      desc: isHi
        ? 'माप पुस्तिका (MB), फोटो साक्ष्य, और उपयोगिता प्रमाणपत्रों की अखंडता जांच।'
        : 'Audits physical geo-tagged inspection photos, completion certificates, and utilization filings.'
    },
    {
      no: '08',
      title: isHi ? 'कार्यान्वयन एजेंसी साख' : 'Historical Agency Reliability',
      desc: isHi
        ? 'कार्यान्वयन एजेंसियों का पूर्व ट्रैक रिकॉर्ड और डिफ़ॉल्ट दर।'
        : 'Assesses implementing agency track records, past delayed projects, and execution reliability ratings.'
    }
  ];

  return (
    <div style={{ background: 'var(--color-bg-light)', color: 'var(--color-text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── 1. NAVBAR ─── */}
      <Header
        activeSection={null}
        setActiveSection={() => {}}
        onFeatureSelect={(id) => navigate(`/features/${id}`)}
      />

      {/* ─── 2. MAIN CONTENT ─── */}
      <main style={{ flex: 1, paddingTop: '105px', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Breadcrumbs & Back Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <span
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer', color: '#1D1E22', fontWeight: 600 }}
              >
                {isHi ? 'होम' : 'Home'}
              </span>
              <span>/</span>
              <span style={{ color: '#0A2458', fontWeight: 700 }}>
                {isHi ? 'हमारे बारे में' : 'About Us'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-outline-dark"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.95rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: '#FFFFFF',
                border: '1.5px solid #1D1E22',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '2px 2px 0px #1D1E22',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={15} strokeWidth={2.4} />
              <span>{isHi ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}</span>
            </button>
          </div>

          {/* ─── HERO HEADER ─── */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #1D1E22',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '3px 4px 0px #1D1E22',
              padding: 'clamp(2rem, 4vw, 3.25rem)',
              marginBottom: '2.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#E8F5E9', border: '1px solid #1E7E34', borderRadius: 'var(--radius-full)', padding: '0.35rem 0.9rem', marginBottom: '1.25rem' }}>
              <ShieldCheck size={16} color="#1E7E34" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E7E34', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Smart India Hackathon 2026 • Team SAGE
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif-primary)',
                fontSize: 'clamp(2.2rem, 4.2vw, 3.25rem)',
                fontWeight: 800,
                color: '#1D1E22',
                margin: '0 0 1rem 0',
                lineHeight: 1.18
              }}
            >
              {isHi ? 'निरीक्षक एआई (NIRIKSHAK AI)' : 'About NIRIKSHAK AI'}
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.65,
                color: 'var(--color-text-secondary)',
                maxWidth: '850px',
                margin: '0 0 1.5rem 0'
              }}
            >
              {isHi
                ? 'निरीक्षक एआई (NIRIKSHAK AI) संसद सदस्य स्थानीय क्षेत्र विकास योजना (MPLADS) के लिए एक अग्रगामी, कृत्रिम बुद्धिमत्ता-संचालित राष्ट्रीय निगरानी और जोखिम आसूचना प्रणाली है। इसका उद्देश्य सार्वजनिक विकास कोष की वास्तविक समय में निगरानी और पारदर्शी शासन सुनिश्चित करना है।'
                : 'NIRIKSHAK AI is an AI-powered national risk intelligence and continuous forensic monitoring platform for the Member of Parliament Local Area Development Scheme (MPLADS). Built to turn complex, high-volume public expenditure records into transparent, explainable, and actionable governance insights.'}
            </p>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', paddingTop: '1.25rem', borderTop: '1px solid rgba(29, 30, 34, 0.12)' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E7E34' }}>543+</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {isHi ? 'लोकसभा क्षेत्र' : 'Constituencies Monitored'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A2458' }}>1,320+</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {isHi ? 'संसद सदस्य प्रोफाइल' : 'MP Profiles Analyzed'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1D1E22' }}>₹10,000+ Cr</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {isHi ? 'विकास कोष विश्लेषण' : 'Public Funds Evaluated'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E5B842' }}>8 Pillars</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {isHi ? 'जोखिम विश्लेषण स्तंभ' : 'Forensic Risk Engines'}
                </div>
              </div>
            </div>
          </div>

          {/* ─── SECTION 1: OUR MISSION ─── */}
          <div
            style={{
              background: '#FAF8F3',
              border: '1.5px solid #1D1E22',
              borderRadius: 'var(--radius-md)',
              padding: '2rem 2.25rem',
              boxShadow: '3px 4px 0px #1D1E22',
              marginBottom: '2.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Compass size={22} color="#1E7E34" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1D1E22', margin: 0 }}>
                {isHi ? 'हमारा मिशन' : 'Our Mission'}
              </h2>
            </div>
            <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: 0 }}>
              {isHi
                ? 'सार्वजनिक धन के उपयोग को पश्चात्-सत्यापन (post-facto) वाली कागजी प्रक्रिया से बदलकर एक सतत, वास्तविक समय और पारदर्शी डिजिटल शासन में रूपांतरित करना। हम नागरिकों, जिला प्रशासन और केंद्रीय मंत्रालयों को निष्पक्ष और व्याख्या-योग्य साक्ष्य आधारित निर्णय लेने में सक्षम बनाते हैं।'
                : 'To modernize public fund accountability by shifting from retrospective, manual sample audits to proactive, continuous computational governance. NIRIKSHAK AI bridges the gap between massive government open data and actionable oversight—equipping citizens, district magistrates, and nodal ministries with transparent, evidence-grounded risk indicators.'}
            </p>
          </div>

          {/* ─── SECTION 2: THE PROBLEM ─── */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D9534F', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {isHi ? 'पृष्ठभूमि और चुनौतियां' : 'The Systemic Challenge'}
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1D1E22', margin: 0 }}>
                {isHi ? 'एमपीलैड्स निगरानी में क्या समस्याएं आती हैं?' : 'Why Monitoring MPLADS is Complex'}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: '#FFFFFF', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: '2px 2px 0px #1D1E22' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid #D9534F' }}>
                  <AlertTriangle size={20} color="#D9534F" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1D1E22', marginBottom: '0.5rem' }}>
                  {isHi ? 'विशाल डेटा और कागजी अंतराल' : 'Sheer Volume & Paper Silos'}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {isHi
                    ? 'प्रत्येक वर्ष हजारों परियोजनाएं देश भर में स्वीकृत होती हैं। पारंपरिक नमूना ऑडिट में केवल 2-5% फाइलों की ही जांच हो पाती है, जिससे कई खामियां अनदेखी रह जाती हैं।'
                    : 'Over 100,000 civil works are sanctioned across 543 Lok Sabha and 245 Rajya Sabha tenures. Manual spot inspections cover less than 3% of sanctioned projects, leaving critical oversight gaps.'}
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: '2px 2px 0px #1D1E22' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid #E5B842' }}>
                  <Cpu size={20} color="#B8860B" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1D1E22', marginBottom: '0.5rem' }}>
                  {isHi ? 'असामान्य देरी और फंड लॉकिंग' : 'Chronic Delays & Idle Balances'}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {isHi
                    ? 'स्वीकृत राशि बैंक खातों में महीनों पड़ी रहती है या भौतिक प्रगति 30% होने पर भी 90% फंड जारी हो जाता है, बिना किसी स्वचालित अलर्ट के।'
                    : 'Funds often sit idle in nodal bank accounts, or payments are released without matching physical progress milestones on ground, leading to capital lock-in and abandoned civic assets.'}
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: '2px 2px 0px #1D1E22' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid #1A73E8' }}>
                  <Layers size={20} color="#1A73E8" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1D1E22', marginBottom: '0.5rem' }}>
                  {isHi ? 'कार्टेल और दोहराव की पहचान' : 'Vendor Cartels & Duplicate Assets'}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {isHi
                    ? 'अलग-अलग योजनाओं या वर्षों में एक ही स्थान पर समान कार्य की स्वीकृति अथवा एक ही एजेंसी द्वारा बिना प्रतिस्पर्धा के कार्य हासिल करना।'
                    : 'Unidentified contractor networks bidding collusively, or repeat sanctions placed on identical road stretches or community borewells across changing parliamentary terms.'}
                </p>
              </div>
            </div>
          </div>

          {/* ─── SECTION 3: OUR APPROACH ─── */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #1D1E22',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(2rem, 3.5vw, 3rem)',
              boxShadow: '3px 4px 0px #1D1E22',
              marginBottom: '3rem'
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E7E34', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {isHi ? 'तकनीकी ढांचा' : 'Methodology & Architecture'}
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1D1E22', margin: 0 }}>
                {isHi ? 'हमारा दृष्टिकोण: साक्ष्य आधारित पारदर्शी शासन' : 'Our Approach: End-to-End Computational Oversight'}
              </h2>
            </div>

            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
              {isHi
                ? 'निरीक्षक एआई सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI) के आधिकारिक एमपीलैड्स डेटा पोर्टल से सीधे जुड़े सार्वजनिक रिकॉर्ड का विश्लेषण करता है। यह सिस्टम चार मुख्य चरणों में कार्य करता है:'
                : 'NIRIKSHAK AI ingests, normalizes, and audits data directly from official MoSPI portals, executing multi-tiered forensic evaluation across four clear stages:'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: '#FAF8F3', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0A2458', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Stage 1: Ingestion
                </div>
                <div style={{ fontWeight: 700, color: '#1D1E22', fontSize: '1rem', marginBottom: '0.4rem' }}>
                  {isHi ? 'सरकारी डेटा एकत्रीकरण' : 'Live Data ETL Pipeline'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {isHi ? 'मंत्रालय के आधिकारिक डेटाबेस से आवंटन, व्यय, वेंडर और कार्य विवरण का स्वतः सिंक।' : 'Syncs real allocations, sanctions, expenditures, and vendor records across all 36 States & UTs.'}
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: '#FAF8F3', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E7E34', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Stage 2: Analysis
                </div>
                <div style={{ fontWeight: 700, color: '#1D1E22', fontSize: '1rem', marginBottom: '0.4rem' }}>
                  {isHi ? '8-स्तंभ जोखिम स्कोरिंग' : '8-Pillar Risk Engine'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {isHi ? 'प्रत्येक परियोजना का 0-100 स्कोर पर मूल्यांकन, जिसमें विसंगति की स्पष्ट वजह दर्ज होती है।' : 'Scores each project from 0–100 with clear explainable driver tags and deviation coefficients.'}
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: '#FAF8F3', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B8860B', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Stage 3: Evidence
                </div>
                <div style={{ fontWeight: 700, color: '#1D1E22', fontSize: '1rem', marginBottom: '0.4rem' }}>
                  {isHi ? 'साक्ष्य व भू-सत्यापन' : 'Evidence Verification'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {isHi ? 'जियोटैग की गई तस्वीरें, बिल इनवॉइस और उपयोगिता प्रमाणपत्रों की डिजिटल समीक्षा।' : 'Cross-checks inspection logs, geotagged progress photos, and Measurement Book filings.'}
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: '#FAF8F3', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D9534F', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Stage 4: Resolution
                </div>
                <div style={{ fontWeight: 700, color: '#1D1E22', fontSize: '1rem', marginBottom: '0.4rem' }}>
                  {isHi ? 'अधिकारी कार्रवाई व रिपोर्ट' : 'Officer Decision Support'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {isHi ? 'जिला नोडल अधिकारियों के लिए स्वचालित ऑडिट रिपोर्ट, नोटिस ड्राफ्ट और फील्ड असाइनमेंट।' : 'Generates structured audit PDFs, spot-check notices, and district-level inspection worklists.'}
                </div>
              </div>
            </div>
          </div>

          {/* ─── SECTION 4: WHAT NIRIKSHAK AI DOES (8 PILLARS) ─── */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0A2458', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {isHi ? 'प्रमुख विश्लेषण प्रणाली' : 'Forensic Modules'}
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1D1E22', margin: 0 }}>
                {isHi ? 'निरीक्षक एआई के 8 जोखिम विश्लेषण स्तंभ' : 'The 8 Risk Pillars of NIRIKSHAK AI'}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              {riskPillars.map((pillar) => (
                <div
                  key={pillar.no}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #1D1E22',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.35rem',
                    boxShadow: '2px 2px 0px #1D1E22',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1E7E34', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                      PILLAR {pillar.no}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1D1E22', marginBottom: '0.5rem' }}>
                      {pillar.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── SECTION 5: RESPONSIBLE & EXPLAINABLE AI ─── */}
          <div
            style={{
              background: '#FAF8F3',
              border: '1.5px solid #1D1E22',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(2rem, 3.5vw, 3rem)',
              boxShadow: '3px 4px 0px #1D1E22',
              marginBottom: '3rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Scale size={24} color="#0A2458" />
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1D1E22', margin: 0 }}>
                {isHi ? 'जिम्मेदार और व्याख्या-योग्य एआई (Explainable AI)' : 'Responsible & Explainable AI Philosophy'}
              </h2>
            </div>

            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              {isHi
                ? 'निरीक्षक एआई "ब्लैक-बॉक्स" दृष्टिकोण को पूरी तरह अस्वीकार करता है। सार्वजनिक शासन में केवल संख्या बता देना पर्याप्त नहीं है; यह बताना आवश्यक है कि कोई जोखिम स्कोर क्यों उत्पन्न हुआ।'
                : 'In public governance, an unexplained algorithmic score is unacceptable. NIRIKSHAK AI adheres strictly to Explainable AI (XAI) and Human-in-the-Loop principles:'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: '#FFFFFF', padding: '1.25rem', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 800, color: '#1E7E34', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  ✓ {isHi ? 'कोई स्वचालित आरोप नहीं' : 'No Automatic Accusations'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {isHi
                    ? 'उच्च जोखिम स्कोर का अर्थ स्वतः कदाचार या भ्रष्टाचार नहीं है। यह केवल प्रशासनिक जांच और फील्ड सत्यापन के लिए प्राथमिकता सूचक है।'
                    : 'A high risk score is never treated as legal proof of wrongdoing. It serves strictly as a prioritization flag directing inspection resources to projects with the largest discrepancies.'}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '1.25rem', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 800, color: '#0A2458', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  ✓ {isHi ? 'स्पष्ट व्याख्या और ब्रेकडाउन' : 'Decomposed Drivers'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {isHi
                    ? 'प्रत्येक स्कोर 8 स्पष्ट स्तंभों में विभाजित होता है, जिससे अधिकारी जान सकते हैं कि जोखिम का कारण लागत विचलन है या देरी।'
                    : 'Every composite score is fully decomposed into its weighted sub-drivers, displaying exact variance percentages, timeline deltas, and reference baseline figures.'}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '1.25rem', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 800, color: '#1D1E22', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  ✓ {isHi ? 'मानव अधिकारी अंतिम निर्णयकर्ता' : 'Human Authority Retention'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {isHi
                    ? 'अंतिम सत्यापन, स्पष्टीकरण और कानूनी निर्णय सदैव संबंधित जिला कलेक्टर एवं मंत्रालय के सक्षम अधिकारियों के पास सुरक्षित रहता है।'
                    : 'Final verification, justification acceptance, and executive action remain 100% in the hands of authorized District Collectors and MoSPI Nodal Officers.'}
                </div>
              </div>
            </div>
          </div>



        </div>
      </main>

      {/* ─── 3. FOOTER ─── */}
      <Footer onLoginClick={() => navigate('/login')} />
    </div>
  );
};

export default AboutUsView;
