import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../Header';
import Footer from '../Footer';

const TermsOfServiceView = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const sections = [
    {
      id: 'acceptance',
      title: isHi ? '1. शर्तों की स्वीकृति' : '1. Acceptance of Terms',
      content: isHi
        ? 'निरीक्षक एआई (NIRIKSHAK AI) प्लेटफॉर्म का उपयोग करके, आप इन सेवा की शर्तों को स्वीकार करते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया प्लेटफॉर्म का उपयोग न करें।'
        : 'By accessing, browsing, or utilizing the NIRIKSHAK AI platform, users agree to be bound by these Terms of Service, applicable laws, and relevant governance guidelines. If you do not accept these terms, you must refrain from using the platform.'
    },
    {
      id: 'purpose',
      title: isHi ? '2. प्लेटफॉर्म का उद्देश्य एवं कार्यक्षेत्र' : '2. Purpose and Scope of NIRIKSHAK AI',
      content: isHi
        ? 'निरीक्षक एआई एक अनुसंधान, सार्वजनिक निगरानी और निर्णय-सहायता मंच है जिसका उद्देश्य संसद सदस्य स्थानीय क्षेत्र विकास योजना (MPLADS) के कार्यों की वित्तीय एवं भौतिक प्रगति का विश्लेषण करना है। यह नागरिकों को पारदर्शी डेटा और अधिकारियों को फोरेंसिक जोखिम विश्लेषण उपलब्ध कराता है।'
        : 'NIRIKSHAK AI is designed as a public-service transparency tool and an administrative decision-support platform for the Member of Parliament Local Area Development Scheme (MPLADS). It transforms publicly available expenditure records into continuous risk intelligence to promote accountability and effective public asset delivery.'
    },
    {
      id: 'permitted-use',
      title: isHi ? '3. अनुमत उपयोग' : '3. Permitted Use',
      content: isHi
        ? 'उपयोगकर्ता प्लेटफॉर्म का उपयोग नागरिक निगरानी, शैक्षणिक अनुसंधान, पत्रकारिता विश्लेषण और आधिकारिक प्रशासनिक समीक्षा के लिए कर सकते हैं। डेटा का उपयोग निष्पक्ष और जनहितैषी उद्देश्यों के लिए किया जाना चाहिए।'
        : 'Users are granted a revocable, non-exclusive license to use the platform for lawful, public-interest purposes including citizen oversight, academic and policy research, journalistic review, and official administrative audit. Any use must adhere strictly to fair data practices.'
    },
    {
      id: 'user-responsibilities',
      title: isHi ? '4. उपयोगकर्ता के उत्तरदायित्व एवं निषेध' : '4. User Responsibilities & Prohibited Activities',
      content: isHi
        ? 'उपयोगकर्ता निम्नलिखित गतिविधियों में संलिप्त नहीं होंगे:\n• प्लेटफॉर्म पर किसी प्रकार का दुर्भावनापूर्ण हमला या स्वचालित अनधिकृत स्क्रैपिंग।\n• किसी भी जनप्रतिनिधि, अधिकारी या वेंडर के विरुद्ध डेटा की गलत या भ्रामक व्याख्या प्रस्तुत करना।\n• सिस्टम की सुरक्षा या प्रमाणीकरण प्रोटोकॉल को बायपास करने का प्रयास करना।'
        : 'Users agree not to:\n• Engage in unauthorized high-frequency automated scraping, denial-of-service attacks, or malicious probing of platform APIs.\n• Misrepresent algorithmic risk indicators as conclusive proof of personal guilt, illegality, or financial criminality.\n• Attempt to bypass, compromise, or alter Role-Based Access Control (RBAC) security protocols or audit trail records.'
    },
    {
      id: 'official-responsibilities',
      title: isHi ? '5. आधिकारिक खाताधारकों के दायित्व' : '5. Official Account Responsibilities',
      content: isHi
        ? 'जिला और मंत्रालय स्तर के आधिकारिक खातों वाले उपयोगकर्ताओं का यह कर्तव्य है कि वे अपने लॉगिन क्रेडेंशियल को सुरक्षित रखें और साक्ष्य समीक्षा अथवा फील्ड सत्यापन में केवल प्रामाणिक सरकारी रिपोर्ट ही दर्ज करें।'
        : 'Authorized personnel accessing elevated administrative tiers (District Authorities and Ministry Auditors) must maintain credential confidentiality. Official users are solely responsible for ensuring that inspection notes, Measurement Book cross-checks, and field verification entries submitted through the platform reflect truthful, verified on-site findings.'
    },
    {
      id: 'data-limitations',
      title: isHi ? '6. डेटा सटीकता एवं सीमाएं' : '6. Data Accuracy and Platform Limitations',
      content: isHi
        ? 'प्लेटफॉर्म पर उपलब्ध डेटा सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI) और संबंधित जिला प्राधिकरणों द्वारा प्रकाशित आधिकारिक रिकॉर्ड पर आधारित है। डेटा सिंक में तकनीकी समय-अंतराल हो सकता है, और स्थानीय स्तर पर हाल में हुए संशोधनों के लिए आधिकारिक नोडल रिकॉर्ड प्राथमिक संदर्भ रहेंगे।'
        : 'NIRIKSHAK AI ingests data directly from official government disclosures (including MoSPI portals and state treasuries). While rigorous normalization pipelines are executed, data accuracy reflects the underlying published government source. Local offline vouchers or recent manual reconciliations may experience technical synchronization latency.'
    },
    {
      id: 'ai-indicators',
      title: isHi ? '7. एआई-जनरेटेड जोखिम संकेतक' : '7. AI-Generated Risk Indicators',
      content: isHi
        ? 'निरीक्षक एआई द्वारा जनरेट किए गए सभी स्कोर, हीटमैप और कार्टेल क्लस्टर सांख्यिकीय मॉडल और विसंगति पहचान एल्गोरिदम पर आधारित हैं। ये संकेतक प्रशासनिक जांच के लिए प्राथमिक मार्गदर्शक हैं, न कि दोषसिद्धि के प्रमाण।'
        : 'All risk scores, discrepancy flags, cartel cluster graphs, and timeline delay indicators are computational outputs generated by statistical modeling and anomaly-detection heuristics. They serve to highlight projects deviating from normal distributions, not to declare moral or legal guilt.'
    },
    {
      id: 'no-automatic-allegations',
      title: isHi ? '8. कोई स्वतः कदाचार का आरोप नहीं (गैर-अपमानजनक खंड)' : '8. No Automatic Allegation of Fraud',
      content: isHi
        ? 'स्पष्ट रूप से घोषित किया जाता है कि उच्च जोखिम स्कोर किसी भी व्यक्ति, संसद सदस्य, ठेकेदार या अधिकारी पर भ्रष्टाचार या कदाचार का कानूनी आरोप नहीं है। असामान्य व्यय या देरी कई वैध कारणों से भी हो सकती है (जैसे भूमि विवाद, बाढ़ या तकनीकी संशोधन)। बिना मानवीय पुष्टि के इसे कदाचार न माना जाए।'
        : 'CRITICAL CLAUSE: A high risk score, red flag, or anomaly alert must NEVER automatically be construed, cited, or published as proof of corruption, fraud, embezzlement, or criminal conduct. Projects frequently encounter legitimate deviations due to geographical terrain, court stays, land acquisition hurdles, seasonal weather, or administrative restructuring. The platform explicitly disclaims any intent to defame or accuse individuals without statutory investigation.'
    },
    {
      id: 'human-review',
      title: isHi ? '9. अनिवार्य मानवीय सत्यापन (Human-in-the-Loop)' : '9. Mandatory Human Review Requirement',
      content: isHi
        ? 'किसी भी आधिकारिक कार्रवाई, भुगतान रोकने या जांच शुरू करने से पहले संबंधित सक्षम अधिकारी द्वारा भौतिक निरीक्षण और फाइलों की प्रत्यक्ष मानवीय जांच अनिवार्य है।'
        : 'No adverse administrative, fiscal, or disciplinary action may be initiated solely on the basis of an automated algorithmic score. Independent on-site verification, physical measurement, and formal administrative review by competent district or ministerial authorities remain mandatory prerequisites for any enforcement action.'
    },
    {
      id: 'intellectual-property',
      title: isHi ? '10. बौद्धिक संपदा अधिकार' : '10. Intellectual Property Rights',
      content: isHi
        ? 'निरीक्षक एआई का समग्र डिजाइन, जोखिम एल्गोरिदम और इंटरफेस टीम SAGE (स्मार्ट इंडिया हैकाथॉन 2026) की बौद्धिक संपदा है। सार्वजनिक सरकारी डेटा उसके संबंधित स्वामियों के अधीन रहता है।'
        : 'The NIRIKSHAK AI software architecture, custom risk models, analytical dashboards, and interface components are the intellectual property of Team SAGE (Smart India Hackathon 2026). Public domain MPLADS scheme data remains the property of the respective government authorities.'
    },
    {
      id: 'service-availability',
      title: isHi ? '11. सेवा उपलब्धता एवं रखरखाव' : '11. Service Availability',
      content: isHi
        ? 'हम निरंतर और सुगम सेवा प्रदान करने का प्रयास करते हैं, परंतु सर्वर रखरखाव या सरकारी डेटाबेस कनेक्टिविटी के कारण सेवा में अस्थायी रुकावट हो सकती है।'
        : 'The platform is provided on an "as-is" and "as-available" basis. While maximum uptime and system responsiveness are prioritized, temporary disruptions may occur during scheduled maintenance, algorithmic retraining, or third-party government server downtime.'
    },
    {
      id: 'liability-limitation',
      title: isHi ? '12. दायित्व की सीमा' : '12. Limitation of Liability',
      content: isHi
        ? 'कानून द्वारा अनुमत सीमा तक, टीम SAGE और प्रोजेक्ट डेवलपर प्लेटफॉर्म के डेटा के आधार पर लिए गए किसी स्वतंत्र निर्णय, अप्रत्यक्ष नुकसान या व्याख्या के लिए उत्तरदायी नहीं होंगे।'
        : 'To the fullest extent permitted by law, Team SAGE, developers, and platform maintainers shall not be held liable for any direct, indirect, or incidental damages resulting from the interpretation, reliance upon, or use of algorithmic risk outputs by third parties.'
    },
    {
      id: 'changes-and-contact',
      title: isHi ? '13. शर्तों में परिवर्तन एवं संपर्क' : '13. Changes to Terms & Contact',
      content: isHi
        ? 'हम इन शर्तों को आवश्यकतानुसार संशोधित कर सकते हैं। किसी भी प्रश्न या आधिकारिक पत्राचार के लिए contact@nirikshak.gov.in पर संपर्क करें।'
        : 'We reserve the right to revise these Terms of Service as governance frameworks evolve. Continued use of the platform constitutes acceptance of revised terms. For questions regarding these terms, contact contact@nirikshak.gov.in.'
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
                {isHi ? 'सेवा की शर्तें' : 'Terms of Service'}
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#E8F0FE', border: '1px solid #1A73E8', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.85rem', marginBottom: '1rem' }}>
              <Scale size={14} color="#1A73E8" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1A73E8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isHi ? 'कानूनी नियम एवं उपयोग दिशानिर्देश' : 'Platform Terms & Governance Rules'}
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
              {isHi ? 'सेवा की शर्तें' : 'Terms of Service'}
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
                ? 'निरीक्षक एआई का उपयोग करने से पहले कृपया इन शर्तों को ध्यानपूर्वक पढ़ें। यह दस्तावेज़ उपयोगकर्ता अधिकारों, एआई जोखिम संकेतकों की सांख्यिकीय प्रकृति और प्रशासनिक उत्तरदायित्वों को परिभाषित करता है।'
                : 'Please review these terms carefully before utilizing the NIRIKSHAK AI platform. This document defines permitted use, our critical AI decision-support disclaimer, and administrative verification obligations.'}
            </p>

            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isHi ? 'प्रभावी तिथि: सितंबर 2026 • संस्करण 1.2' : 'Effective Date: September 2026 • Version 1.2'}
            </div>
          </div>

          {/* ─── MANDATORY AI DISCLAIMER CALLOUT BANNER ─── */}
          <div
            style={{
              background: '#FFF8E1',
              border: '2px solid #B8860B',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem 1.75rem',
              boxShadow: '3px 4px 0px #1D1E22',
              marginBottom: '2.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1.5px solid #B8860B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={22} color="#B8860B" />
            </div>

            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1D1E22', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isHi ? 'महत्वपूर्ण एआई अस्वीकरण एवं वैधानिक स्पष्टीकरण' : 'Mandatory AI Risk & Non-Accusation Disclaimer'}
              </div>
              <p style={{ fontSize: '0.92rem', color: '#1D1E22', lineHeight: 1.65, margin: 0 }}>
                {isHi
                  ? 'निरीक्षक एआई केवल निर्णय-सहायता और प्राथमिकता-निर्धारण के लिए जोखिम संकेतक प्रदान करता है। किसी भी उच्च जोखिम स्कोर या विसंगति अलर्ट को स्वतः धोखाधड़ी, भ्रष्टाचार या कदाचार का कानूनी प्रमाण नहीं माना जा सकता है। अंतिम तथ्यात्मक सत्यापन, फील्ड जांच और विधिक कार्रवाई का अधिकार केवल अधिकृत प्रशासनिक अधिकारियों के पास सुरक्षित है।'
                  : 'NIRIKSHAK AI provides statistical risk indicators and computational decision-support intelligence for prioritizing administrative oversight. A high risk score, red flag, or anomaly alert MUST NOT automatically be treated as proof of fraud, corruption, or legal wrongdoing. Final on-ground verification, inspection of measurement books, and any official proceedings remain solely within the statutory jurisdiction of authorized government officials.'}
              </p>
            </div>
          </div>

          {/* ─── SECTIONS LIST ─── */}
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

export default TermsOfServiceView;
