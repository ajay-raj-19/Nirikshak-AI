import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Info, Download, LayoutGrid, List, MapPin, CheckCircle2,
  AlertTriangle, ArrowRight, X, Award, User,
  ChevronLeft, ChevronRight, ShieldAlert, CheckCircle, FileText
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  CURRENT_18TH_MPS_DATA,
  RAJYA_SABHA_MPS_DATA,
  HISTORICAL_17TH_MPS_DATA,
  ALL_MPS_DATA,
  getMpsSummaryStats
} from '../../data/mpPerformanceData';
import { exportStructuredAuditPdf } from '../../services/pdfExportService';
import Footer from '../Footer';

const PAGE_SIZE = 12;

const BrowseMpsView = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const cardsTopRef = useRef(null);

  // Filters State — Default sorted by MP Name (A–Z) per forensic accounting standards
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all'); // 'all' | 'reconciliation' | 'normal' | 'high' | 'avg' | 'low'
  const [selectedHouse, setSelectedHouse] = useState('all'); // 'all' (18th Lok Sabha Default) | 'Rajya Sabha' | '17th Lok Sabha'
  const [sortBy, setSortBy] = useState('ratio_desc'); // Default: Reconciled Disbursement / Sanctioned Ratio (High to Low)
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever search, house, tier, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedHouse, selectedTier, sortBy]);

  // Calculate dataset based on selected house / tenure
  // Authoritative default: 540 Sitting Members of the 18th Lok Sabha
  const houseMps = useMemo(() => {
    if (selectedHouse === 'Rajya Sabha') return RAJYA_SABHA_MPS_DATA;
    if (selectedHouse === '17th Lok Sabha') return HISTORICAL_17TH_MPS_DATA;
    return CURRENT_18TH_MPS_DATA;
  }, [selectedHouse]);

  const summaryStats = useMemo(() => {
    return getMpsSummaryStats(houseMps);
  }, [houseMps]);

  // ─── 3-TIER AUDIT STATUS HELPER ───
  // Evaluates actual backend audit fields without hardcoding or suppressing anomalies
  const getReconciliationStatus = (mp) => {
    const dupCount = Number(mp.duplicateVoucherCount || 0);
    const dupCr = mp.duplicateDisbursedCr != null ? Number(mp.duplicateDisbursedCr).toFixed(2) : '0.00';
    const disbursed = Number(mp.disbursedCr || 0);
    const sanctioned = Number(mp.sanctionedCr || 0);

    // Status 1: Reconciled — Review Pending
    // Suspected duplicate records have been isolated, pending independent audit confirmation
    if (dupCount > 0) {
      return {
        type: 'review_pending',
        label: isHi ? 'समाधित — समीक्षा लंबित' : 'Reconciled — Review Pending',
        shortLabel: isHi ? 'समीक्षा लंबित' : 'Review Pending',
        badgeBg: '#FEF3C7',
        badgeColor: '#92400E',
        badgeBorder: '#D97706',
        icon: '⚠️',
        summary: isHi
          ? `${dupCount} संदिग्ध डुप्लिकेट रिकॉर्ड · ₹${dupCr} करोड़ समीक्षाधीन`
          : `${dupCount} suspected duplicate records · ₹${dupCr} Cr under review`,
        needsReview: true
      };
    }

    // Status 2: Reconciliation Required
    // Unresolved duplicate or financial discrepancies (e.g. disbursement exceeds sanction)
    if (disbursed > sanctioned) {
      return {
        type: 'reconciliation_required',
        label: isHi ? 'पुनर्समाधान आवश्यक' : 'Reconciliation Required',
        shortLabel: isHi ? 'पुनर्समाधान' : 'Reconciliation Required',
        badgeBg: '#FEF3C7',
        badgeColor: '#92400E',
        badgeBorder: '#D97706',
        icon: '⚠️',
        summary: isHi
          ? 'संवितरण स्वीकृति से अधिक · समीक्षा आवश्यक'
          : 'Disbursement exceeds sanctioned value · Review required',
        needsReview: true
      };
    }

    // Status 3: No Discrepancy Detected
    // No discrepancies found by the available checks; do not imply official audit certification
    return {
      type: 'no_discrepancy',
      label: isHi ? 'कोई विसंगति नहीं मिली' : 'No Discrepancy Detected',
      shortLabel: isHi ? 'कोई विसंगति नहीं' : 'No Discrepancy',
      badgeBg: '#DCEDEA',
      badgeColor: '#256B68',
      badgeBorder: '#2F7F7A',
      icon: '✓',
      summary: isHi
        ? 'उपलब्ध जांचों में कोई विसंगति नहीं मिली'
        : 'No discrepancies found in ingested records',
      needsReview: false
    };
  };

  // ─── RECONCILED DISBURSEMENT / SANCTIONED RATIO HELPER ───
  // Computes legitimate ratio using reconciled disbursements (isolating suspected duplicates)
  const getMpReconciledRatio = (mp) => {
    if (mp.reconciledDisbursementRatio != null) {
      return Number(mp.reconciledDisbursementRatio);
    }
    const sanctioned = Number(mp.sanctionedCr || 0);
    if (sanctioned <= 0) return null; // N/A
    const reconciled = mp.reconciledDisbursedCr != null
      ? Number(mp.reconciledDisbursedCr)
      : Number(mp.disbursedCr || 0);
    return Math.round((reconciled / sanctioned) * 1000) / 10;
  };

  // Filtered and sorted dataset
  const filteredMps = useMemo(() => {
    let list = houseMps;

    // Filter by Audit & Reconciliation Tier / Progress
    if (selectedTier === 'reconciliation' || selectedTier === 'needs_review') {
      list = list.filter(m => (m.duplicateVoucherCount || 0) > 0 || (Number(m.disbursedCr || 0) > Number(m.sanctionedCr || 0)));
    } else if (selectedTier === 'review_pending') {
      list = list.filter(m => (m.duplicateVoucherCount || 0) > 0);
    } else if (selectedTier === 'reconciliation_required') {
      list = list.filter(m => (m.duplicateVoucherCount || 0) === 0 && Number(m.disbursedCr || 0) > Number(m.sanctionedCr || 0));
    } else if (selectedTier === 'normal' || selectedTier === 'no_discrepancy') {
      list = list.filter(m => (m.duplicateVoucherCount || 0) === 0 && Number(m.disbursedCr || 0) <= Number(m.sanctionedCr || 0));
    } else if (selectedTier === 'high') {
      list = list.filter(m => (m.completionRate != null ? m.completionRate : (m.utilizationPct || 0)) >= 70);
    } else if (selectedTier === 'avg') {
      list = list.filter(m => {
        const val = m.completionRate != null ? m.completionRate : (m.utilizationPct || 0);
        return val >= 40 && val < 70;
      });
    } else if (selectedTier === 'low') {
      list = list.filter(m => (m.completionRate != null ? m.completionRate : (m.utilizationPct || 0)) < 40);
    }

    // Filter by Search Query (Case-insensitive, space tolerant, partial match across Name, Party, Constituency, State)
    const rawSearch = searchQuery.trim();
    if (rawSearch) {
      const cleanQuery = rawSearch.toLowerCase().replace(/\s+/g, ' ');
      const queryTokens = cleanQuery.split(' ').filter(Boolean);

      list = list.filter(m => {
        const n = (m.name || '').toLowerCase();
        const on = (m.officialName || '').toLowerCase();
        const p = (m.party || '').toLowerCase();
        const pn = (m.partyName || '').toLowerCase();
        const phi = (m.partyHi || '').toLowerCase();
        const c = (m.constituency || '').toLowerCase();
        const s = (m.state || '').toLowerCase();

        const combinedText = `${n} ${on} ${p} ${pn} ${phi} ${c} ${s}`;
        const combinedAlpha = combinedText.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');

        // 1. Direct substring match
        if (combinedText.includes(cleanQuery) || combinedAlpha.includes(cleanQuery)) {
          return true;
        }

        // 2. Token match: all query tokens must match within MP data
        return queryTokens.every(t => combinedText.includes(t) || combinedAlpha.includes(t));
      });
    }

    // Sorting — Default Reconciled Disbursement / Sanctioned Works Ratio (High to Low). Safely handles N/A values at the end
    return [...list].sort((a, b) => {
      if (sortBy === 'ratio_desc' || sortBy === 'ratio') {
        const ratioA = getMpReconciledRatio(a);
        const ratioB = getMpReconciledRatio(b);

        const isNaA = ratioA == null || isNaN(ratioA);
        const isNaB = ratioB == null || isNaN(ratioB);
        if (isNaA && isNaB) return (a.name || '').localeCompare(b.name || '');
        if (isNaA) return 1; // N/A at the very end
        if (isNaB) return -1;

        // Exact percentage descending: 70%+ -> 50-69.99% -> 30-49.99% -> <30%
        if (ratioB !== ratioA) {
          return ratioB - ratioA;
        }
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'sanctioned' || sortBy === 'allocated') return (b.sanctionedCr || b.allocatedCr || 0) - (a.sanctionedCr || a.allocatedCr || 0);
      if (sortBy === 'disbursed' || sortBy === 'spent') return (b.disbursedCr || b.spentCr || 0) - (a.disbursedCr || a.spentCr || 0);
      if (sortBy === 'actual') return (b.actualCr || 0) - (a.actualCr || 0);
      if (sortBy === 'completion') return (b.completionRate || 0) - (a.completionRate || 0);
      if (sortBy === 'works') return (b.worksCompleted || 0) - (a.worksCompleted || 0);
      if (sortBy === 'constituency') return (a.constituency || '').localeCompare(b.constituency || '');
      return 0;
    });
  }, [houseMps, selectedTier, searchQuery, sortBy]);

  // Pagination calculation: 12 MPs per page
  const totalMps = filteredMps.length;
  const totalPages = Math.max(1, Math.ceil(totalMps / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalMps);
  const displayedMps = useMemo(() => {
    return filteredMps.slice(startIndex, endIndex);
  }, [filteredMps, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    const targetPage = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(targetPage);
    if (cardsTopRef.current) {
      cardsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Smart page number generator with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safePage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (safePage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedHouse !== 'all') count++;
    if (selectedTier !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedHouse, selectedTier, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTier('all');
    setSelectedHouse('all');
    setSortBy('ratio_desc');
    setCurrentPage(1);
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExport = async () => {
    if (filteredMps.length === 0) return;
    setIsExportingPdf(true);
    try {
      const houseLabel = selectedHouse === 'all' ? 'Both Houses' : selectedHouse;
      await exportStructuredAuditPdf({
        filename: `MPLADS_MPs_Performance_${houseLabel.replace(/\s+/g, '_')}.pdf`,
        title: `MPLADS MEMBERS OF PARLIAMENT PERFORMANCE AUDIT`,
        subtitle: `Filtered House: ${houseLabel} • Total MPs: ${filteredMps.length} • MoSPI Official Audit`,
        metaItems: [
          { label: 'Selected House', value: houseLabel },
          { label: 'MPs Count', value: filteredMps.length },
          { label: 'Tier Filter', value: selectedTier },
          { label: 'Sorting', value: sortBy }
        ],
        kpis: [
          { label: 'Avg Fund Utilization', value: `${(filteredMps.reduce((acc, m) => acc + m.utilizationPct, 0) / (filteredMps.length || 1)).toFixed(1)}%`, color: 'green' },
          { label: 'Total Allocated', value: `₹${filteredMps.reduce((acc, m) => acc + (parseFloat(m.allocatedCr) || 0), 0).toFixed(1)} Cr`, color: 'teal' },
          { label: 'Total Spent', value: `₹${filteredMps.reduce((acc, m) => acc + (parseFloat(m.spentCr) || 0), 0).toFixed(1)} Cr`, color: 'teal' },
        ],
        tables: [
          {
            title: 'MEMBERS OF PARLIAMENT PERFORMANCE SCORECARD',
            headers: ['MP Name', 'House', 'State', 'Constituency', 'Allocated', 'Spent', 'Util %', 'Completion %'],
            colWidths: [40, 20, 30, 30, 20, 20, 15, 15],
            rows: filteredMps.slice(0, 100).map(m => [
              m.name,
              m.house,
              m.state,
              m.constituency,
              `₹${m.allocatedCr} Cr`,
              `₹${m.spentCr} Cr`,
              `${m.utilizationPct}%`,
              `${m.completionRate}%`
            ])
          }
        ]
      });
    } catch (err) {
      console.error('Export MPs error:', err);
      alert('Could not export PDF report. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '100vh', width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '0 1rem' }}>
      {/* ─── 1. BREADCRUMB ─── */}
      <div style={{ paddingTop: '1.25rem', borderBottom: '1px solid rgba(29,30,34,0.08)', paddingBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{isHi ? 'होम' : 'Home'}</span>
          <span>/</span>
          <span>MPLADS</span>
          <span>/</span>
          <span style={{ color: '#2F7F7A', fontWeight: 700 }}>{isHi ? 'सांसद ब्राउज़ करें' : 'Browse MPs'}</span>
        </div>
      </div>

      {/* ─── 2. PAGE HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif-primary)',
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                color: '#1D1E22',
                margin: 0,
                lineHeight: 1.2
              }}
            >
              {isHi ? 'संसद सदस्य फंड उपयोग' : 'Member of Parliament Fund Utilization'}
            </h1>
            <div
              title="MPLADS fund performance data aggregated from official MoSPI portal"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#DCEDEA',
                color: '#2F7F7A',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Info size={15} strokeWidth={2.4} />
            </div>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            {isHi
              ? 'निर्वाचन क्षेत्रों में व्यक्तिगत सांसद के प्रदर्शन और कार्य वितरण का अन्वेषण एवं विश्लेषण करें'
              : 'Browse and analyze individual MP performance across constituencies'}
          </p>
        </div>
      </div>

      {/* ─── 3. SUMMARY STATISTICS SECTION (5 CARDS IN ROUNDED CONTAINER) ─── */}
      <div
        style={{
          background: '#FAF8F3',
          border: '1.5px solid #1D1E22',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '3px 4px 0px #1D1E22',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* TOTAL MPs */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '2px 2px 0px #1D1E22' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isHi ? 'कुल सांसद' : 'TOTAL MPs'}
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1D1E22', lineHeight: 1.15, marginTop: '0.35rem' }}>
              {summaryStats?.totalMps ?? houseMps.length}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2F7F7A', marginTop: '0.25rem', textTransform: 'uppercase' }}>
              {selectedHouse === 'all'
                ? (isHi ? '18वीं लोकसभा (वर्तमान)' : '18th Lok Sabha (Sitting)')
                : selectedHouse === 'Rajya Sabha'
                ? (isHi ? 'राज्यसभा' : 'Rajya Sabha')
                : (isHi ? '17वीं लोकसभा (ऐतिहासिक)' : '17th Lok Sabha (Historical)')}
            </div>
          </div>

          {/* SANCTIONED WORKS VALUE */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '2px 2px 0px #1D1E22' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isHi ? 'स्वीकृत कार्य मूल्य' : 'SANCTIONED WORKS'}
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1D1E22', lineHeight: 1.15, marginTop: '0.35rem' }}>
              ₹{Number(summaryStats.totalSanctionedCr || summaryStats.totalAllocatedCr).toLocaleString()} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>CR</span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              {isHi ? 'स्वीकृत कार्यों की कुल लागत' : 'Cumulative Sanctioned Works'}
            </div>
          </div>

          {/* RECORDED DISBURSEMENTS */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '2px 2px 0px #1D1E22' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isHi ? 'दर्ज संवितरण' : 'RECORDED DISBURSEMENTS'}
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1D1E22', lineHeight: 1.15, marginTop: '0.35rem' }}>
              ₹{Number(summaryStats.totalDisbursedCr).toLocaleString()} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>CR</span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2F7F7A', marginTop: '0.25rem' }}>
              {isHi ? `समाधान के बाद: ₹${Number(summaryStats.totalReconciledDisbursedCr).toLocaleString()} CR` : `Reconciled: ₹${Number(summaryStats.totalReconciledDisbursedCr).toLocaleString()} CR`}
            </div>
          </div>

          {/* CERTIFIED ACTUAL EXPENDITURE */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '2px 2px 0px #1D1E22' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isHi ? 'प्रमाणित वास्तविक व्यय' : 'CERTIFIED EXPENDITURE'}
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1E7E34', lineHeight: 1.15, marginTop: '0.35rem' }}>
              ₹{Number(summaryStats.totalActualCr).toLocaleString()} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>CR</span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              {isHi ? 'पूर्ण कार्यों का सत्यापित व्यय' : 'Completed Works Certified Cost'}
            </div>
          </div>

          {/* RECONCILIATION FLAGS */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: '2px 2px 0px #1D1E22' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isHi ? 'समाधान संकेतक' : 'RECONCILIATION AUDIT'}
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: summaryStats.reconciliationCount > 0 ? '#B45309' : '#1E7E34', lineHeight: 1.15, marginTop: '0.35rem' }}>
              {summaryStats.reconciliationCount} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>MPs</span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#B45309', marginTop: '0.25rem' }}>
              {summaryStats.duplicateVouchersCount.toLocaleString()} duplicate vouchers flagged
            </div>
          </div>
        </div>

        {/* GoI Funds Released & Official Fund Utilization Accounting Disclaimer */}
        <div
          style={{
            background: '#F1F5F9',
            border: '1px solid #CBD5E1',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.95rem',
            fontSize: '0.76rem',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={14} color="#0284C7" style={{ flexShrink: 0 }} />
            <span>
              <strong>{isHi ? 'आधिकारिक फंड उपयोग:' : 'Official Fund Utilization:'}</strong> {isHi ? 'उपलब्ध नहीं (N/A) • केंद्रीय आवंटन/किस्त विमुक्ति (GoI Funds Released) आंकड़े वर्तमान स्नैपशॉट में उपलब्ध नहीं हैं।' : 'N/A • Official GoI Central Release Tranches not provided in dataset snapshot.'}
            </span>
          </div>
          <span style={{ fontSize: '0.73rem', color: '#64748B', fontStyle: 'italic' }}>
            {isHi ? '*लेखांकन मानकों के अनुसार स्वीकृत कार्यों को भाजक नहीं बनाया जा सकता।' : '*Under accounting standards, Sanctioned Works cannot be substituted as denominator.'}
          </span>
        </div>
      </div>

      {/* ─── 4. PERFORMANCE & RECONCILIATION CLASSIFICATION (3 HORIZONTAL CARDS) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
        {/* All MPs */}
        <div
          onClick={() => setSelectedTier('all')}
          style={{
            background: selectedTier === 'all' ? '#F0FDF4' : '#FFFFFF',
            border: selectedTier === 'all' ? '2px solid #2F7F7A' : '1.5px solid #1D1E22',
            borderRadius: 'var(--radius-md)',
            boxShadow: '3px 4px 0px #1D1E22',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2F7F7A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isHi ? 'सभी सांसद' : 'ALL MPs'}
            </span>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2F7F7A' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1D1E22' }}>
            {summaryStats?.totalMps ?? houseMps.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {isHi ? 'सभी 540 वर्तमान सांसद' : 'Complete sitting MP database'}
          </div>
        </div>

        {/* Review Needed / Reconciliation */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'needs_review' ? 'all' : 'needs_review')}
          style={{
            background: (selectedTier === 'needs_review' || selectedTier === 'reconciliation' || selectedTier === 'review_pending') ? '#FFFBEB' : '#FFFFFF',
            border: (selectedTier === 'needs_review' || selectedTier === 'reconciliation' || selectedTier === 'review_pending') ? '2px solid #D97706' : '1.5px solid #1D1E22',
            borderRadius: 'var(--radius-md)',
            boxShadow: '3px 4px 0px #1D1E22',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isHi ? '⚠️ समीक्षा / पुनर्समाधान' : '⚠️ REVIEW PENDING / RECONCILIATION'}
            </span>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#92400E' }}>
            {summaryStats?.reconciliationCount ?? 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {isHi ? 'संदिग्ध डुप्लिकेट रिकॉर्ड समीक्षाधीन' : 'Suspected duplicate records isolated for review'}
          </div>
        </div>

        {/* No Discrepancy Detected */}
        <div
          onClick={() => setSelectedTier(selectedTier === 'no_discrepancy' ? 'all' : 'no_discrepancy')}
          style={{
            background: (selectedTier === 'no_discrepancy' || selectedTier === 'normal') ? '#E8F5E9' : '#FFFFFF',
            border: (selectedTier === 'no_discrepancy' || selectedTier === 'normal') ? '2px solid #2F7F7A' : '1.5px solid #1D1E22',
            borderRadius: 'var(--radius-md)',
            boxShadow: '3px 4px 0px #1D1E22',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#256B68', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isHi ? '✓ कोई विसंगति नहीं' : '✓ NO DISCREPANCY DETECTED'}
            </span>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2F7F7A' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1D1E22' }}>
            {(summaryStats?.totalMps ?? houseMps.length) - (summaryStats?.reconciliationCount ?? 0)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {isHi ? 'उपलब्ध जांचों में कोई विसंगति नहीं मिली' : 'No discrepancies found by available checks'}
          </div>
        </div>
      </div>

      {/* ─── 5. FILTER / CONTROL PANEL ─── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #1D1E22',
          borderRadius: 'var(--radius-md)',
          boxShadow: '3px 4px 0px #1D1E22',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: '1 1 260px', minWidth: '220px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              {isHi ? 'खोज:' : 'Search:'}
            </span>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={isHi ? 'सांसद, निर्वाचन क्षेत्र या राज्य खोजें...' : 'Search MPs, constituencies, or states...'}
                className="mp-control-input"
                style={{
                  width: '100%',
                  height: '36px',
                  padding: searchQuery ? '0 2.2rem 0 2.4rem' : '0 0.85rem 0 2.4rem',
                  fontSize: '0.84rem',
                  fontFamily: 'var(--font-sans)',
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-sm)',
                  background: '#FAF8F3',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  style={{
                    position: 'absolute',
                    right: '0.65rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem'
                  }}
                  title={isHi ? 'खोज साफ़ करें' : 'Clear search'}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Controls Group */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.85rem', flexWrap: 'wrap' }}>
            {/* Audit Status / Filter Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Status Filter:</span>
              <select
                value={selectedTier}
                onChange={(e) => { setSelectedTier(e.target.value); setCurrentPage(1); }}
                className="mp-control-select"
                style={{
                  height: '36px',
                  padding: '0 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-sm)',
                  background: '#FAF8F3',
                  color: '#1D1E22',
                  cursor: 'pointer',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="all">{isHi ? 'सभी सांसद (540)' : 'All MPs (540)'}</option>
                <option value="needs_review">{isHi ? '⚠️ समीक्षा या पुनर्समाधान (91)' : '⚠️ All Review Needed (91)'}</option>
                <option value="review_pending">{isHi ? '⚠️ समीक्षा लंबित (90)' : '⚠️ Reconciled — Review Pending (90)'}</option>
                <option value="reconciliation_required">{isHi ? '⚠️ पुनर्समाधान आवश्यक (1)' : '⚠️ Reconciliation Required (1)'}</option>
                <option value="no_discrepancy">{isHi ? '✓ कोई विसंगति नहीं (449)' : '✓ No Discrepancy Detected (449)'}</option>
                <option value="high">{isHi ? 'उच्च पूर्णता (≥70%)' : 'High Completion (≥70%)'}</option>
                <option value="avg">{isHi ? 'मध्यम पूर्णता (40–69%)' : 'Moderate Completion (40–69%)'}</option>
                <option value="low">{isHi ? 'कम पूर्णता (<40%)' : 'Low Completion (<40%)'}</option>
              </select>
            </div>

            {/* House Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>House:</span>
              <select
                value={selectedHouse}
                onChange={(e) => { setSelectedHouse(e.target.value); setCurrentPage(1); }}
                className="mp-control-select"
                style={{
                  height: '36px',
                  padding: '0 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-sm)',
                  background: '#FAF8F3',
                  color: '#1D1E22',
                  cursor: 'pointer',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="all">{isHi ? '18वीं लोकसभा (वर्तमान - 540)' : '18th Lok Sabha (Current - 540)'}</option>
                <option value="Rajya Sabha">{isHi ? 'राज्यसभा (235)' : 'Rajya Sabha (235)'}</option>
                <option value="17th Lok Sabha">{isHi ? '17वीं लोकसभा (ऐतिहासिक - 544)' : '17th Lok Sabha (Historical - 544)'}</option>
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mp-control-select"
                style={{
                  height: '36px',
                  padding: '0 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-sm)',
                  background: '#FAF8F3',
                  color: '#1D1E22',
                  cursor: 'pointer',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="ratio_desc">
                  {isHi ? 'संवितरण / स्वीकृति अनुपात: उच्च से निम्न' : 'Disbursement / Sanction Ratio: High to Low'}
                </option>
                <option value="name">MP Name (A–Z)</option>
                <option value="sanctioned">{isHi ? 'स्वीकृत कार्य मूल्य' : 'Sanctioned Works Value'}</option>
                <option value="disbursed">{isHi ? 'दर्ज संवितरण' : 'Recorded Disbursements'}</option>
                <option value="actual">{isHi ? 'प्रमाणित वास्तविक व्यय' : 'Certified Actual Expenditure'}</option>
                <option value="completion">{isHi ? 'पूर्णता दर' : 'Completion Rate'}</option>
                <option value="works">{isHi ? 'पूर्ण कार्य' : 'Works Completed'}</option>
                <option value="constituency">Constituency</option>
              </select>
            </div>

            {/* Grid / List Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'transparent' }}>View</span>
              <div style={{ display: 'flex', height: '36px', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-sm)', overflow: 'hidden', boxSizing: 'border-box' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0 0.75rem',
                    height: '100%',
                    background: viewMode === 'grid' ? '#2F7F7A' : '#FAF8F3',
                    color: viewMode === 'grid' ? '#FFFFFF' : '#1D1E22',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <LayoutGrid size={14} />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '0 0.75rem',
                    height: '100%',
                    background: viewMode === 'list' ? '#2F7F7A' : '#FAF8F3',
                    color: viewMode === 'list' ? '#FFFFFF' : '#1D1E22',
                    border: 'none',
                    borderLeft: '1.5px solid #1D1E22',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <List size={14} />
                  <span>List</span>
                </button>
              </div>
            </div>

            {/* Export Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'transparent' }}>Export</span>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExportingPdf}
                className="btn-outline-dark no-print"
                style={{
                  height: '36px',
                  padding: '0 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#FAF8F3',
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-sm)',
                  cursor: isExportingPdf ? 'wait' : 'pointer',
                  opacity: isExportingPdf ? 0.7 : 1,
                  boxSizing: 'border-box'
                }}
              >
                <Download size={14} />
                <span>{isExportingPdf ? (isHi ? 'पीडीएफ बन रहा है...' : 'Generating PDF...') : (isHi ? 'पीडीएफ निर्यात' : 'Export PDF')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(29,30,34,0.08)', paddingTop: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1D1E22' }}>
              All MPs ({filteredMps.length})
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
              {filteredMps.length} MPs found with {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
            </span>

            {/* Filter Chips */}
            {searchQuery.trim() && (
              <span
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.6rem',
                  background: '#DCEDEA',
                  border: '1px solid #2F7F7A',
                  color: '#256B68',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title={isHi ? 'खोज साफ़ करें' : 'Clear search'}
              >
                "{searchQuery.trim()}" <X size={12} />
              </span>
            )}

            {selectedHouse !== 'all' && (
              <span
                onClick={() => setSelectedHouse('all')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.6rem',
                  background: '#DCEDEA',
                  border: '1px solid #2F7F7A',
                  color: '#256B68',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {selectedHouse === 'Rajya Sabha' ? (isHi ? 'राज्यसभा' : 'Rajya Sabha') : (isHi ? '17वीं लोकसभा' : '17th Lok Sabha')} <X size={12} />
              </span>
            )}

            {selectedTier !== 'all' && (
              <span
                onClick={() => setSelectedTier('all')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.6rem',
                  background: '#DCEDEA',
                  border: '1px solid #2F7F7A',
                  color: '#256B68',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {selectedTier === 'high' ? 'High Performers' : selectedTier === 'avg' ? 'Average Performers' : 'Needs Improvement'} <X size={12} />
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="clear-filters-btn"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#2F7F7A',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ─── 6. MP CARDS (GRID OR LIST VIEW) ─── */}
      <div ref={cardsTopRef} style={{ scrollMarginTop: '1.5rem', width: '100%' }}>
        {/* Results summary bar directly above cards */}
        {filteredMps.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
              padding: '0.65rem 1rem',
              background: '#FAF8F3',
              border: '1.5px solid #1D1E22',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '1.5px 2px 0px #1D1E22'
            }}
          >
            <div style={{ fontSize: '0.84rem', color: '#1D1E22', fontWeight: 600 }}>
              {isHi ? (
                <>कुल <strong>{totalMps}</strong> सांसदों में से <strong>{startIndex + 1}–{endIndex}</strong> दिखाए जा रहे हैं (प्रति पृष्ठ 12 सांसद)</>
              ) : (
                <>Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalMps}</strong> MPs (12 per page)</>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.65rem',
                  background: '#FFFFFF',
                  border: '1px solid #1D1E22',
                  borderRadius: 'var(--radius-full)',
                  color: '#0A2458'
                }}
              >
                {isHi ? `पृष्ठ ${safePage} / ${totalPages}` : `Page ${safePage} of ${totalPages}`}
              </span>
            </div>
          </div>
        )}

      {filteredMps.length === 0 ? (
        <div style={{ background: '#FFFFFF', border: '1.5px solid #1D1E22', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
          <h3 style={{ fontFamily: 'var(--font-serif-primary)', fontSize: '1.35rem', color: '#1D1E22' }}>
            {isHi ? 'कोई सांसद नहीं मिला' : 'No MPs Found'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            {searchQuery.trim()
              ? (isHi ? `"${searchQuery}" के लिए कोई सांसद नहीं मिला। कृपया वर्तनी जांचें या खोज साफ़ करें।` : `No MPs match the search "${searchQuery}". Try a different spelling or clear the search.`)
              : (isHi ? 'कृपया अपने फ़िल्टर बदलें या साफ़ करें।' : 'Try changing your search terms or clearing active filters.')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                className="btn-outline-dark"
                style={{
                  padding: '0.5rem 1.25rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  background: '#FAF8F3',
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {isHi ? 'खोज साफ़ करें' : 'Clear Search'}
              </button>
            )}
            <button type="button" onClick={handleClearFilters} className="btn-teal-accent" style={{ padding: '0.5rem 1.25rem', cursor: 'pointer' }}>
              {isHi ? 'सभी फ़िल्टर रीसेट करें' : 'Reset All Filters'}
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* 4-COLUMN RESPONSIVE GRID (12 CARDS PER PAGE) */
        <div
          key={`mp-grid-${safePage}-${searchQuery.trim()}-${selectedHouse}-${selectedTier}-${sortBy}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))',
            gap: '1.25rem'
          }}
        >
          {displayedMps.map((mp, index) => {
            const isHigh = (mp.completionRate || 0) >= 70;
            const isAvg = (mp.completionRate || 0) >= 40 && (mp.completionRate || 0) < 70;
            const cardKey = `grid-${mp.id || 'mp'}-${mp.slug || ''}-${mp.term || ''}-${mp.constituency || ''}-${index}`;
            const recStatus = getReconciliationStatus(mp);

            return (
              <div
                key={cardKey}
                className="mp-card-item"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '3px 4px 0px #1D1E22',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  minHeight: '485px',
                  boxSizing: 'border-box',
                  position: 'relative'
                }}
              >
                {/* Top: Avatar & Name */}
                <div>
                  {/* Avatar Circle */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#2F7F7A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <User size={22} />
                  </div>

                  {/* MP Name & Term */}
                  <h4 style={{ fontFamily: 'var(--font-serif-primary)', fontSize: '1.12rem', fontWeight: 800, color: '#1D1E22', margin: '0 0 0.35rem 0', lineHeight: 1.3 }}>
                    {mp.name} ({mp.term})
                  </h4>

                  {/* Location Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                    <MapPin size={13} />
                    <span>{mp.constituency}{mp.state && mp.state.toLowerCase() !== mp.constituency.toLowerCase() ? `, ${mp.state}` : ''}</span>
                  </div>

                  {/* House & Party Badges */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'inline-block', padding: '0.15rem 0.55rem', background: '#DCEDEA', border: '1px solid #2F7F7A', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 700, color: '#256B68' }}>
                      {mp.house}
                    </div>
                    {mp.party && (
                      <div
                        title={mp.partyName || mp.party}
                        style={{ display: 'inline-block', padding: '0.15rem 0.55rem', background: '#FAF8F3', border: '1px solid #1D1E22', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 700, color: '#1D1E22' }}
                      >
                        {isHi && mp.partyHi ? mp.partyHi : mp.party}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3 Financial Accounting Metric Cells */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.4rem',
                    background: '#FAF8F3',
                    border: '1px solid #1D1E22',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.55rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      {isHi ? 'स्वीकृत' : 'SANCTIONED'}
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1D1E22', marginTop: '0.15rem' }}>
                      ₹{mp.sanctionedCr ?? mp.allocatedCr ?? 0} <span style={{ fontSize: '0.66rem' }}>CR</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      {isHi ? 'संवितरण' : 'DISBURSED'}
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1D1E22', marginTop: '0.15rem' }}>
                      ₹{mp.disbursedCr ?? mp.spentCr ?? 0} <span style={{ fontSize: '0.66rem' }}>CR</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      {isHi ? 'प्रमाणित व्यय' : 'ACTUAL'}
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1E7E34', marginTop: '0.15rem' }}>
                      ₹{mp.actualCr ?? 0} <span style={{ fontSize: '0.66rem' }}>CR</span>
                    </div>
                  </div>
                </div>

                {/* Zero Current-Tenure Works Notice */}
                {!mp.hasCurrentData ? (
                  <div
                    style={{
                      background: '#FFF9C4',
                      border: '1.5px dashed #F57F17',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      color: '#E65100',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      lineHeight: 1.35
                    }}
                  >
                    <Info size={14} style={{ flexShrink: 0 }} />
                    <span>{isHi ? 'वर्तमान डेटासेट स्नैपशॉट में कोई 18वीं लोकसभा कार्य उपलब्ध नहीं है।' : 'No 18th Lok Sabha MPLADS works available in the current dataset snapshot.'}</span>
                  </div>
                ) : mp.warning ? (
                  <div
                    style={{
                      background: '#FFF3E0',
                      border: '1px solid #FF9800',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#E65100',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <AlertTriangle size={13} />
                    <span>{mp.warning}</span>
                  </div>
                ) : null}

                {/* Reconciliation Status Section (Consistent Compact Height across ALL Cards) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {/* Disbursed / Sanction Ratio */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      <span>{isHi ? 'संवितरण / स्वीकृति अनुपात' : 'DISBURSED / SANCTION RATIO'}</span>
                    </div>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1D1E22' }}>
                      {(() => {
                        const r = getMpReconciledRatio(mp);
                        return r != null ? `${r}%` : 'N/A';
                      })()}
                    </span>
                  </div>

                  {/* Row 3: Compact Professional Reconciliation Status Box */}
                  <div
                    style={{
                      background: '#FAF8F3',
                      border: '1px solid #1D1E22',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.65rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      minHeight: '56px',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {/* Small Status Badge (Amber only when review is needed) */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.15rem 0.5rem',
                          background: recStatus.badgeBg,
                          color: recStatus.badgeColor,
                          border: `1px solid ${recStatus.badgeBorder}`,
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.67rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          lineHeight: 1.2
                        }}
                      >
                        <span>{recStatus.icon}</span>
                        <span>{recStatus.label}</span>
                      </span>
                    </div>

                    {/* Concise 1-line Summary */}
                    <div
                      style={{
                        fontSize: '0.67rem',
                        color: recStatus.needsReview ? '#78350F' : 'var(--color-text-secondary)',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={recStatus.summary}
                    >
                      {recStatus.summary}
                    </div>
                  </div>
                </div>

                {/* Work Stats Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#1E7E34' }}>
                    <CheckCircle2 size={13} />
                    <span>COMPLETED {mp.worksCompleted}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2F7F7A' }}>
                    <Award size={13} />
                    <span>RECOMMENDED {mp.worksRecommended}</span>
                  </span>
                </div>

                {/* Completion Rate */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <span>COMPLETION RATE</span>
                  <span style={{ fontWeight: 800, color: '#1D1E22' }}>{mp.completionRate}%</span>
                </div>

                {/* Bottom View Details Link */}
                <div style={{ borderTop: '1px solid rgba(29,30,34,0.1)', paddingTop: '0.75rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/mps/${mp.slug}`)}
                    className="view-details-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: '#2F7F7A',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>View Details →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* HORIZONTAL LIST VIEW (12 CARDS PER PAGE) */
        <div
          key={`mp-list-${safePage}-${searchQuery.trim()}-${selectedHouse}-${selectedTier}-${sortBy}`}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {displayedMps.map((mp, index) => {
            const cardKey = `list-${mp.id || 'mp'}-${mp.slug || ''}-${mp.term || ''}-${mp.constituency || ''}-${index}`;

            return (
              <div
                key={cardKey}
                className="mp-card-item"
                style={{
                  background: '#FFFFFF',
                  border: mp.reconciliationRequired ? '1.5px solid #F59E0B' : '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: mp.reconciliationRequired ? '3px 4px 0px #F59E0B' : '3px 4px 0px #1D1E22',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem'
                }}
              >
                {/* Left Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 'min(100%, 260px)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#2F7F7A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-serif-primary)', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#1D1E22' }}>
                      {mp.name} ({mp.term})
                    </h4>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <MapPin size={12} />
                      <span>{mp.constituency}{mp.state && mp.state.toLowerCase() !== mp.constituency.toLowerCase() ? `, ${mp.state}` : ''}</span>
                      <span>•</span>
                      <span style={{ fontWeight: 700, color: '#256B68' }}>{mp.house}</span>
                      {mp.party && (
                        <>
                          <span>•</span>
                          <span
                            title={mp.partyName || mp.party}
                            style={{ fontWeight: 700, color: '#1D1E22', background: '#FAF8F3', padding: '0.1rem 0.4rem', border: '1px solid #1D1E22', borderRadius: 'var(--radius-sm)' }}
                          >
                            {isHi && mp.partyHi ? mp.partyHi : mp.party}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mid Financials — Separated Metrics */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>{isHi ? 'स्वीकृत' : 'SANCTIONED'}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1D1E22' }}>₹{mp.sanctionedCr ?? mp.allocatedCr ?? 0} CR</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>{isHi ? 'दर्ज संवितरण' : 'DISBURSED'}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1D1E22' }}>₹{mp.disbursedCr ?? mp.spentCr ?? 0} CR</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>{isHi ? 'प्रमाणित व्यय' : 'ACTUAL'}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E7E34' }}>₹{mp.actualCr ?? 0} CR</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>{isHi ? 'अनुपात' : 'RATIO'}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1D1E22' }}>
                      {(() => {
                        const r = getMpReconciledRatio(mp);
                        return r != null ? `${r}%` : 'N/A';
                      })()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>STATUS</div>
                    {(() => {
                      const listRecStatus = getReconciliationStatus(mp);
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.15rem 0.5rem',
                            background: listRecStatus.badgeBg,
                            color: listRecStatus.badgeColor,
                            border: `1px solid ${listRecStatus.badgeBorder}`,
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>{listRecStatus.icon}</span>
                          <span>{listRecStatus.shortLabel}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>COMPLETED</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1D1E22' }}>{mp.worksCompleted} / {mp.worksRecommended}</div>
                  </div>
                </div>

                {/* Right Action */}
                <div>
                  <button
                    type="button"
                    onClick={() => navigate(`/mps/${mp.slug}`)}
                    className="btn-teal-accent"
                    style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                  >
                    <span>View Details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* ─── 7. PAGINATION CONTROLS (12 MPs PER PAGE) ─── */}
      {filteredMps.length > 0 && totalPages > 1 && (
        <div
          style={{
            background: '#FAF8F3',
            border: '1.5px solid #1D1E22',
            borderRadius: 'var(--radius-md)',
            boxShadow: '2.5px 3px 0px #1D1E22',
            padding: '0.9rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
            margin: '0.5rem 0 1.5rem 0'
          }}
        >
          {/* Range Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#1D1E22', fontWeight: 600 }}>
            <span
              style={{
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                background: '#FFFFFF',
                border: '1px solid #1D1E22',
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#0A2458'
              }}
            >
              {startIndex + 1}–{endIndex}
            </span>
            <span>
              {isHi
                ? `कुल ${totalMps} में से ${startIndex + 1}–${endIndex} सांसद`
                : `Showing ${startIndex + 1}–${endIndex} of ${totalMps} MPs`}
            </span>
          </div>

          {/* Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {/* First Page Button */}
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={safePage <= 1}
              className="btn-outline-dark"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: '#FFFFFF',
                border: '1.5px solid #1D1E22',
                borderRadius: 'var(--radius-sm)',
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                opacity: safePage <= 1 ? 0.45 : 1,
                boxShadow: safePage <= 1 ? 'none' : '1.5px 2px 0px #1D1E22'
              }}
              title={isHi ? 'पहला पृष्ठ' : 'First Page'}
            >
              «
            </button>

            {/* Previous Button */}
            <button
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage <= 1}
              className="btn-outline-dark"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: '#FFFFFF',
                border: '1.5px solid #1D1E22',
                borderRadius: 'var(--radius-sm)',
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                opacity: safePage <= 1 ? 0.45 : 1,
                boxShadow: safePage <= 1 ? 'none' : '1.5px 2px 0px #1D1E22'
              }}
            >
              <ChevronLeft size={14} strokeWidth={2.4} />
              <span>{isHi ? 'पिछला' : 'Prev'}</span>
            </button>

            {/* Numeric Page Buttons */}
            {getPageNumbers().map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    style={{
                      padding: '0.3rem 0.45rem',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    …
                  </span>
                );
              }
              const isCurrent = pageNum === safePage;
              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    minWidth: '34px',
                    height: '34px',
                    padding: '0 0.4rem',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid #1D1E22',
                    background: isCurrent ? '#2F7F7A' : '#FFFFFF',
                    color: isCurrent ? '#FFFFFF' : '#1D1E22',
                    cursor: 'pointer',
                    boxShadow: isCurrent ? '1.5px 2px 0px #1D1E22' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage >= totalPages}
              className="btn-outline-dark"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: '#FFFFFF',
                border: '1.5px solid #1D1E22',
                borderRadius: 'var(--radius-sm)',
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: safePage >= totalPages ? 0.45 : 1,
                boxShadow: safePage >= totalPages ? 'none' : '1.5px 2px 0px #1D1E22'
              }}
            >
              <span>{isHi ? 'अगला' : 'Next'}</span>
              <ChevronRight size={14} strokeWidth={2.4} />
            </button>

            {/* Last Page Button */}
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={safePage >= totalPages}
              className="btn-outline-dark"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: '#FFFFFF',
                border: '1.5px solid #1D1E22',
                borderRadius: 'var(--radius-sm)',
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: safePage >= totalPages ? 0.45 : 1,
                boxShadow: safePage >= totalPages ? 'none' : '1.5px 2px 0px #1D1E22'
              }}
              title={isHi ? 'अंतिम पृष्ठ' : 'Last Page'}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <Footer hideCTAButtons={true} />

      <style>{`
        .mp-card-item {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .mp-card-item:hover {
          transform: translateY(-3px);
          box-shadow: 4px 6px 0px #1D1E22 !important;
        }
        .mp-control-input:focus,
        .mp-control-select:focus {
          border-color: #2F7F7A !important;
          box-shadow: 0 0 0 2px #DCEDEA !important;
        }
        .view-details-link {
          color: #2F7F7A !important;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .view-details-link:hover {
          color: #256B68 !important;
          text-decoration: underline !important;
        }
        .clear-filters-btn:hover {
          color: #256B68 !important;
        }
        .btn-teal-accent {
          background-color: #2F7F7A !important;
          color: #FFFFFF !important;
          border: 1.5px solid #1D1E22 !important;
          border-radius: var(--radius-sm) !important;
          box-shadow: 1.5px 2px 0px #1D1E22 !important;
          transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .btn-teal-accent:hover {
          background-color: #256B68 !important;
          box-shadow: 2.5px 3.5px 0px #1D1E22 !important;
          transform: translate(-1px, -1.5px);
        }
      `}</style>
    </div>
  );
};

export default BrowseMpsView;
