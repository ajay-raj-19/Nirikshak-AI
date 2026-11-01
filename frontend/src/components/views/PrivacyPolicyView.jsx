import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Lock, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../Header';
import Footer from '../Footer';

const PrivacyPolicyView = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const sections = [
    {
      id: 'information-processed',
      title: isHi ? '1. हम कौन सी जानकारी संसाधित करते हैं' : '1. Information We Process',
      content: isHi
        ? 'निरीक्षक एआई मुख्य रूप से सार्वजनिक रूप से उपलब्ध सरकारी योजना रिकॉर्ड और प्रणाली के संचालन के लिए आवश्यक बुनियादी तकनीकी डेटा को संसाधित करता है। हम गैर-आवश्यक व्यक्तिगत डेटा का संग्रह नहीं करते हैं।'
        : 'NIRIKSHAK AI processes two main categories of information: publicly available government scheme records and basic operational data required for role-based authentication and platform stability.'
    },
    {
      id: 'public-mplads-data',
      title: isHi ? '2. सार्वजनिक एमपीलैड्स डेटा' : '2. Public MPLADS Data',
      content: isHi
        ? 'हमारे द्वारा प्रदर्शित अधिकांश डेटा संसद सदस्य स्थानीय क्षेत्र विकास योजना (MPLADS) के आधिकारिक सार्वजनिक पोर्टलों (जैसे MoSPI mplads.mospi.gov.in) से लिया गया है। इसमें सांसदों के नाम, निर्वाचन क्षेत्र, स्वीकृत कार्य विवरण, वित्तीय आवंटन, व्यय राशि और अनुबंधित एजेंसियों के सार्वजनिक रिकॉर्ड शामिल हैं। यह जानकारी भारत सरकार के खुले डेटा सिद्धांतों और सूचना के अधिकार के तहत सार्वजनिक हित में प्रदर्शित की जाती है।'
        : 'The overwhelming majority of project, financial, and administrative records displayed on NIRIKSHAK AI are sourced directly from public disclosures published by the Ministry of Statistics and Programme Implementation (MoSPI). This includes parliamentary constituency allocations, project titles, sanction dates, expenditure amounts, implementing agency designations, and contractor identifiers. These records are published in the public domain in accordance with open government data transparency standards.'
    },
    {
      id: 'authentication-info',
      title: isHi ? '3. प्रमाणीकरण और खाता जानकारी' : '3. Authentication & Account Information',
      content: isHi
        ? 'सामान्य नागरिकों के लिए सार्वजनिक डैशबोर्ड बिना किसी पंजीकरण के उपलब्ध है। प्रशासनिक और आधिकारिक सुविधाओं का उपयोग करने वाले अधिकृत अधिकारियों (जिला कलेक्टर, नोडल अधिकारी, ऑडिटर) के लिए हम नाम, आधिकारिक ईमेल पता, भूमिका पदनाम और क्रिप्टोग्राफिक रूप से सुरक्षित (hashed) पासवर्ड संग्रहीत करते हैं।'
        : 'Public citizens can access analytical dashboards, MP directory views, and state metrics freely without creating an account or providing personal details. For designated administrative users (District Collectors, Nodal Officers, and Ministry Auditors) authorized to access evidence review or resolution tools, the platform maintains basic credentials including full name, official email address, administrative role, and securely hashed passwords.'
    },
    {
      id: 'how-info-used',
      title: isHi ? '4. जानकारी का उपयोग कैसे किया जाता है' : '4. How Information Is Used',
      content: isHi
        ? 'एकत्रित डेटा का उपयोग केवल निम्नलिखित उद्देश्यों के लिए किया जाता है:\n• एमपीलैड्स परियोजनाओं में वित्तीय और समय-सीमा विसंगतियों की पहचान करना।\n• 8-स्तंभ जोखिम स्कोर और विश्लेषणात्मक हीटमैप तैयार करना।\n• अधिकृत अधिकारियों को निरीक्षण रिपोर्ट और फील्ड सत्यापन असाइनमेंट में सहायता देना।\n• सिस्टम की विश्वसनीयता, सुरक्षा और प्रदर्शन सुनिश्चित करना।'
        : 'Processed information is used strictly to support transparent public governance and anomaly detection:\n• Generating composite risk scores and highlighting milestone discrepancies across civil works.\n• Correlating contractor networks to identify potential anti-competitive clustering.\n• Enabling authorized nodal officers to dispatch inspection tasks and record field verification findings.\n• Generating auditable summary reports and structured PDFs for official administrative record-keeping.'
    },
    {
      id: 'analytics-logging',
      title: isHi ? '5. एनालिटिक्स और सिस्टम लॉगिंग' : '5. Analytics and System Logging',
      content: isHi
        ? 'हम सिस्टम स्थिरता, एपीआई लोड और त्रुटि निवारण के लिए बुनियादी सर्वर लॉग (जैसे अनुरोध का समय, आईपी पता, और त्रुटि कोड) बनाए रखते हैं। हम किसी भी तृतीय-पक्ष विज्ञापन नेटवर्क या ट्रैकिंग कुकीज का उपयोग नहीं करते हैं।'
        : 'Standard HTTP server logs are recorded for diagnostics, API performance monitoring, and security troubleshooting. These logs may record timestamp, request method, requested endpoint, client user-agent, and response status codes. NIRIKSHAK AI does not deploy commercial advertising trackers, pixel beacons, or monetized cross-site tracking tools.'
    },
    {
      id: 'data-security',
      title: isHi ? '6. डेटा सुरक्षा उपाय' : '6. Data Security Practices',
      content: isHi
        ? 'प्रशासनिक डेटा और प्रमाणीकरण सुरक्षा के लिए हम उद्योग-मानक सुरक्षा उपाय अपनाते हैं, जिनमें पासवर्ड हैशिंग (Bcrypt/Argon2), भूमिका-आधारित पहुंच नियंत्रण (RBAC) और नेटवर्क ट्रांसमिशन एन्क्रिप्शन (HTTPS/TLS) शामिल हैं।'
        : 'We apply appropriate technical and organizational safeguards proportional to the platform architecture. Internal user passwords are cryptographically hashed using modern salted algorithms before storage. Access to administrative APIs is protected via session tokens and strict Role-Based Access Control (RBAC). Data in transit is secured using standard TLS (Transport Layer Security).'
    },
    {
      id: 'data-retention',
      title: isHi ? '7. डेटा प्रतिधारण (Data Retention)' : '7. Data Retention',
      content: isHi
        ? 'ऐतिहासिक तुलना और बहु-वर्षीय विकास विश्लेषण के लिए सार्वजनिक योजना डेटा प्लेटफॉर्म में बना रहता है। सिस्टम लॉग और अस्थायी सत्र टोकन नियमित अंतराल पर स्वचालित रूप से हटा दिए जाते हैं।'
        : 'Public scheme expenditure data is retained indefinitely to support longitudinal analysis across changing Lok Sabha terms and five-year plan cycles. Operational server diagnostic logs and transient session tokens are periodically rotated and purged.'
    },
    {
      id: 'third-party-services',
      title: isHi ? '8. तृतीय-पक्ष सेवाएं' : '8. Third-Party Services',
      content: isHi
        ? 'हम आवश्यक बुनियादी ढांचे (जैसे ओपनस्ट्रीटमैप/मैप टाइल प्रदाता) और सार्वजनिक डेटा एपीआई के साथ इंटरफेस करते हैं। किसी भी बाहरी पक्ष को वाणिज्यिक उपयोग के लिए उपयोगकर्ता डेटा बेचा या साझा नहीं किया जाता है।'
        : 'NIRIKSHAK AI utilizes public mapping tiles (such as OpenStreetMap services) to render geospatial views. The platform does not sell, lease, or monetize any user or visitor information to commercial third parties, brokers, or marketing networks.'
    },
    {
      id: 'user-rights',
      title: isHi ? '9. उपयोगकर्ता अधिकार एवं पारदर्शिता' : '9. User and Citizen Rights',
      content: isHi
        ? 'नागरिकों को सार्वजनिक विकास रिकॉर्ड तक स्वतंत्र पहुंच का अधिकार है। यदि किसी प्रकाशित सरकारी आंकड़े में कोई लिपिकीय त्रुटि पाई जाती है, तो उसे संबंधित मंत्रालय/नोडल एजेंसी के आधिकारिक रिकॉर्ड से मिलान के पश्चात अद्यतन किया जा सकता है।'
        : 'Citizens possess the right to inspect public developmental records published on the platform. As NIRIKSHAK AI reflects official records published by MoSPI, any requests for factual corrections in underlying project metadata must follow the official reconciliation channels of the respective district nodal office or the Ministry.'
    },
    {
      id: 'policy-updates',
      title: isHi ? '10. नीति में संशोधन' : '10. Policy Updates',
      content: isHi
        ? 'यह गोपनीयता नीति नए फीचर्स, कानूनी आवश्यकताओं या सरकारी दिशानिर्देशों के अनुरूप समय-समय पर अद्यतन की जा सकती है। संशोधनों की जानकारी इस पृष्ठ पर अद्यतन तिथि के साथ प्रकाशित की जाएगी।'
        : 'This Privacy Policy may be updated periodically to reflect architectural improvements, new feature releases, or evolving digital governance guidelines. Changes will be posted directly to this page with an updated revision date.'
    },
    {
      id: 'contact',
      title: isHi ? '11. संपर्क सूत्र' : '11. Contact & Inquiries',
      content: isHi
        ? 'यदि आपके पास इस गोपनीयता नीति या डेटा हैंडलिंग के संबंध में कोई प्रश्न हैं, तो आप प्रोजेक्ट टीम से contact@nirikshak.gov.in या हमारे आधिकारिक सहायता चैनल पर संपर्क कर सकते हैं।'
        : 'For questions, feedback, or administrative inquiries regarding this Privacy Policy and data governance practices, please reach out to Team SAGE via the contact channels provided in the platform footer or via email at contact@nirikshak.gov.in.'
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
        <div style={{ maxWidth: '920px', margin: '0 auto', padding: '0 1.5rem' }}>

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
                {isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}
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
              padding: 'clamp(2rem, 3.5vw, 2.75rem)',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#E8F5E9', border: '1px solid #1E7E34', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem', marginBottom: '1rem' }}>
              <Lock size={14} color="#1E7E34" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1E7E34', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isHi ? 'सार्वजनिक शासन एवं डेटा नैतिकता' : 'Transparency & Public Ethics'}
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif-primary)',
                fontSize: 'clamp(2.2rem, 4vw, 3rem)',
                fontWeight: 800,
                color: '#1D1E22',
                margin: '0 0 0.85rem 0',
                lineHeight: 1.2
              }}
            >
              {isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </h1>

            <p
              style={{
                fontSize: '1.02rem',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary)',
                margin: '0 0 1.25rem 0'
              }}
            >
              {isHi
                ? 'निरीक्षक एआई सार्वजनिक धन की पारदर्शिता और डेटा उत्तरदायित्व के सिद्धांतों पर आधारित है। यह नीति स्पष्ट करती है कि हम सार्वजनिक रिकॉर्ड, प्रशासनिक लॉगिन और तकनीकी जानकारी का किस प्रकार निष्पक्ष प्रबंधन करते हैं।'
                : 'NIRIKSHAK AI is built to uphold transparency and ethical data stewardship in the monitoring of public development funds. This policy outlines how public records, official credentials, and system diagnostics are processed.'}
            </p>

            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isHi ? 'अंतिम अद्यतन: सितंबर 2026 • संस्करण 1.2' : 'Effective Date: September 2026 • Version 1.2'}
            </div>
          </div>

          {/* ─── IMPORTANT ETHICS CALLOUT ─── */}
          <div
            style={{
              background: '#FAF8F3',
              border: '1.5px solid #1D1E22',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              boxShadow: '2px 2px 0px #1D1E22',
              marginBottom: '2.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}
          >
            <Shield size={22} color="#1E7E34" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              <span style={{ fontWeight: 800, color: '#1D1E22' }}>
                {isHi ? 'सार्वजनिक पारदर्शिता सिद्धांत: ' : 'Public Domain Principle: '}
              </span>
              {isHi
                ? 'निरीक्षक एआई किसी भी नागरिक की व्यक्तिगत या संवेदनशील निजी जानकारी का मुद्रीकरण अथवा व्यावसायिक साझाकरण नहीं करता है। समस्त योजना डेटा भारत सरकार के आधिकारिक स्रोतों से लिया गया सार्वजनिक रिकॉर्ड है।'
                : 'NIRIKSHAK AI does not commercialize, sell, or profile individual citizens. All developmental project and expenditure data shown on this platform reflects official public-domain records released under government transparency guidelines.'}
            </div>
          </div>

          {/* ─── POLICY SECTIONS LIST ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3.5rem' }}>
            {sections.map((sec) => (
              <div
                key={sec.id}
                id={sec.id}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.75rem 2rem',
                  boxShadow: '2px 2px 0px #1D1E22'
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#0A2458',
                    marginBottom: '0.85rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid rgba(29, 30, 34, 0.1)'
                  }}
                >
                  {sec.title}
                </h2>
                <div
                  style={{
                    fontSize: '0.94rem',
                    lineHeight: 1.7,
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {sec.content}
                </div>
              </div>
            ))}
          </div>

          {/* ─── FOOTER JUMP / BACK TO TOP ─── */}
          <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn-outline-dark"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                background: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              ↑ {isHi ? 'शीर्ष पर वापस जाएं' : 'Back to Top'}
            </button>
          </div>

        </div>
      </main>

      {/* ─── 3. FOOTER ─── */}
      <Footer onLoginClick={() => navigate('/login')} />
    </div>
  );
};

export default PrivacyPolicyView;
