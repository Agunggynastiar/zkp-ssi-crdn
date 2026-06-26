import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { generateAgeProof } from './utils/zkp';
// Taruh di bagian atas file App.jsx
const CONTRACT_ADDRESS = "0xa43c94E997b95A9B7B9937125A60D0626bDa1C2B"; // <-- GANTI DENGAN ALAMAT KONTRAK UTAMAMU DARI REMIX!

const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "uint256[2]", "name": "a", "type": "uint256[2]"},
      {"internalType": "uint256[2][2]", "name": "b", "type": "uint256[2][2]"},
      {"internalType": "uint256[2]", "name": "c", "type": "uint256[2]"},
      {"internalType": "uint256[2]", "name": "input", "type": "uint256[2]"}
    ],
    "name": "verifyProof",
    "outputs": [{"internalType": "boolean", "name": "r", "type": "boolean"}],
    "stateMutability": "view",
    "type": "function"
  }
];
export default function App() {
  const [account, setAccount] = useState(null);
  const [birthYear, setBirthYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [zkProof, setZkProof] = useState(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => setStatus({ type: 'idle', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [status.message]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        setStatus({ type: 'info', message: "Lagi nyambungin koneksi aman ke Web3..." });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setStatus({ type: 'success', message: "Dompet kripto berhasil terhubung!" });
      } catch (err) {
        setStatus({ type: 'error', message: err.message });
      } finally {
        setLoading(false);
      }
    } else {
      setStatus({ type: 'error', message: "MetaMask nggak nemu nih. Install dulu ekstensinya di browsermu ya." });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!account) return;

    // --- MANIFEST VALIDASI AGAR 2020 TIDAK TEMBUS ---
    const tahunSekarang = 2026;
    const hitungUmur = tahunSekarang - parseInt(birthYear, 10);

    if (hitungUmur < 18) {
      setStatus({ 
        type: 'error', 
        message: `Akses Ditolak! Umur kamu baru ${hitungUmur} tahun. Batas minimal adalah 18 tahun.` 
      });
      return; 
    }

    try {
      setLoading(true);
      setZkProof(null);
      setStatus({ type: 'info', message: "Menyiapkan sirkuit. Lagi nge-generate bukti matematika Zero-Knowledge langsung di device kamu..." });
      
      // 1. Generate bukti lokal via SnarkJS WASM
      const result = await generateAgeProof(birthYear);
      setZkProof(result.proof);
      setStatus({ type: 'success', message: "Bukti Zero-Knowledge (ZKP) beres dibuat dan lolos verifikasi lokal!" });
      setIsAccordionOpen(true);

      // 2. KIRIM LANGSUNG KE BLOCKCHAIN SEPOLIA (Integrasi On-Chain)
      setStatus({ type: 'info', message: "Mengirim bukti kriptografi ke Blockchain Sepolia via MetaMask..." });
      
      // Pastikan fungsi sendProofToBlockchain di bawah sudah kamu paste juga di App.jsx
      await sendProofToBlockchain(result.proof, result.publicSignals);

    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- STYLE ENGINE (Premium Web3 Theme) ---
  const S = {
    app: {
      minHeight: '100vh',
      backgroundColor: '#05070f',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #11172e 0%, #05070f 70%)',
      color: '#f8fafc',
      fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      overflowX: 'hidden',
      position: 'relative'
    },
    blob1: {
      position: 'absolute',
      width: '500px',
      height: '500px',
      background: 'linear-gradient(45deg, rgba(0, 212, 255, 0.15), rgba(139, 92, 246, 0.15))',
      filter: 'blur(100px)',
      top: '-10%',
      left: '15%',
      zIndex: 0,
      borderRadius: '50%'
    },
    blob2: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent 60%)',
      filter: 'blur(80px)',
      bottom: '10%',
      right: '10%',
      zIndex: 0
    },
    navBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '100px',
      fontSize: '12px',
      fontWeight: '500',
      letterSpacing: '0.05em',
      color: '#00D4FF',
      textTransform: 'uppercase',
      backdropFilter: 'blur(5px)',
      zIndex: 1,
      marginBottom: '24px'
    },
    hero: {
      textAlign: 'center',
      maxWidth: '700px',
      zIndex: 1,
      marginBottom: '40px'
    },
    title: {
      fontSize: '48px',
      fontWeight: '800',
      letterSpacing: '-0.03em',
      lineHeight: '1.15',
      marginBottom: '16px',
      background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      fontSize: '16px',
      color: '#94a3b8',
      lineHeight: '1.6',
      maxWidth: '520px',
      margin: '0 auto'
    },
    dashboard: {
      width: '100%',
      maxWidth: '1100px',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
      gap: '32px',
      zIndex: 1,
      boxSizing: 'border-box'
    },
    glassCard: {
      background: 'rgba(11, 16, 32, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '24px',
      padding: '36px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0 0 4px 0'
    },
    walletBox: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.04)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    walletInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: account ? 'linear-gradient(45deg, #00D4FF, #8B5CF6)' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px'
    },
    addressText: {
      fontSize: '14px',
      fontWeight: '600',
      color: account ? '#e2e8f0' : '#64748b'
    },
    statusBadge: (isActive) => ({
      padding: '4px 10px',
      borderRadius: '100px',
      fontSize: '11px',
      fontWeight: '600',
      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      color: isActive ? '#10b981' : '#EF4444',
      border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
    }),
    inputContainer: {
      position: 'relative',
      width: '100%'
    },
    input: {
      width: '100%',
      backgroundColor: '#070a13',
      border: `1px solid ${isFocused ? '#8B5CF6' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: isFocused ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'none',
      borderRadius: '14px',
      padding: '18px 16px',
      fontSize: '16px',
      color: '#fff',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      boxSizing: 'border-box'
    },
    floatingLabel: {
      position: 'absolute',
      left: '16px',
      top: birthYear || isFocused ? '-10px' : '18px',
      fontSize: birthYear || isFocused ? '12px' : '16px',
      color: isFocused ? '#00D4FF' : '#64748b',
      backgroundColor: '#0b1020',
      padding: '0 6px',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      pointerEvents: 'none',
      fontWeight: '500'
    },
    primaryBtn: {
      background: account ? 'linear-gradient(90deg, #00D4FF 0%, #8B5CF6 100%)' : '#1e293b',
      color: account ? '#ffffff' : '#64748b',
      cursor: account && !loading ? 'pointer' : 'not-allowed',
      width: '100%',
      padding: '16px',
      borderRadius: '14px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: account ? '0 8px 30px rgba(0, 212, 255, 0.2)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    accordion: {
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      backgroundColor: '#070a13',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    accordionHeader: {
      padding: '18px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.01)',
      userSelect: 'none'
    },
    jsonView: {
      padding: '20px',
      margin: 0,
      backgroundColor: '#04060b',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      color: '#10b981',
      fontSize: '13px',
      fontFamily: "'Fira Code', 'Courier New', monospace",
      overflowX: 'auto',
      maxHeight: '260px'
    },
    actionRow: {
      display: 'flex',
      gap: '12px',
      padding: '12px 20px',
      backgroundColor: '#06080f',
      borderTop: '1px solid rgba(255, 255, 255, 0.03)'
    },
    miniBtn: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      color: '#cbd5e1',
      padding: '8px 14px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    },
    toast: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      padding: '16px 24px',
      borderRadius: '12px',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '500',
      borderLeft: '4px solid',
      backgroundColor: 'rgba(11, 16, 32, 0.85)',
      borderColor: status.type === 'success' ? '#10b981' : status.type === 'error' ? '#EF4444' : '#00D4FF',
      color: '#ffffff'
    },
    statGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    statBox: {
      backgroundColor: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'left'
    },
    guaranteeBanner: {
      background: 'linear-gradient(90deg, rgba(0,214,255,0.03) 0%, rgba(139,92,246,0.03) 100%)',
      border: '1px solid rgba(0, 214, 255, 0.1)',
      borderRadius: '16px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '13px',
      color: '#94a3b8',
      lineHeight: '1.4'
    }
  };

  return (
    <div style={S.app}>
      <div style={S.blob1}></div>
      <div style={S.blob2}></div>

     

      <header style={S.hero}>
        <h1 style={S.title}>Verifikasi Umur<br />Tanpa Buka Identitas</h1>
        <p style={S.subtitle}>
          Buktikan kalau kamu sudah cukup umur (18+) pakai matematika terenkripsi. Nggak perlu ketik nama, nggak perlu upload KTP, dan bebas lacak.
        </p>
      </header>

      <main style={S.dashboard}>
        
        {/* Kolom Kiri */}
        <section style={S.glassCard}>
          <div>
            <h3 style={S.sectionTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 1 0-4Z"/></svg>
              Status Dompet Web3
            </h3>
            <div style={S.walletBox}>
              <div style={S.walletInfo}>
                <div style={S.avatar}>{account ? '🌐' : '🔒'}</div>
                <div>
                  <div style={S.addressText}>
                    {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Belum Terhubung"}
                  </div>
                  {account && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>ECDSA Node Aktif</div>}
                </div>
              </div>
              <div>
                {account ? (
                  <div style={S.statusBadge(true)}>AKTIF</div>
                ) : (
                  <button 
                    onClick={connectWallet} 
                    disabled={loading}
                    style={{ ...S.miniBtn, backgroundColor: '#2563eb', borderColor: '#3b82f6', color: '#fff', padding: '6px 12px' }}
                  >
                    Hubungkan MetaMask
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={S.sectionTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              Input Data Sirkuit
            </h3>
            
            <div style={S.inputContainer}>
              <input 
                type="number" 
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={S.input}
                disabled={loading || !account}
                required
              />
              <label style={S.floatingLabel}>Tahun Lahir Kamu</label>
            </div>

            <button 
              type="submit" 
              disabled={loading || !account}
              style={S.primaryBtn}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Lagi Ngeproses Bukti...
                </span>
              ) : "Buat Bukti Aman Sekarang"}
            </button>
          </form>

          {zkProof && (
            <div>
              <h3 style={S.sectionTitle}>Hasil Bukti Kriptografi (ZKP)</h3>
              <div style={S.accordion}>
                <div style={S.accordionHeader} onClick={() => setIsAccordionOpen(!isAccordionOpen)}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✔ groth16_proof.json
                  </span>
                  <span style={{ transform: isAccordionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '12px' }}>▼</span>
                </div>
                {isAccordionOpen && (
                  <div>
                    <pre style={S.jsonView}>{JSON.stringify(zkProof, null, 2)}</pre>
                    <div style={S.actionRow}>
                      <button style={S.miniBtn} onClick={() => copyToClipboard(JSON.stringify(zkProof))}>
                        {copied ? "✔ Berhasil Disalin!" : "🗐 Salin Kode JSON"}
                      </button>
                      <button style={S.miniBtn} onClick={() => {
                        const blob = new Blob([JSON.stringify(zkProof, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'zk_age_proof.json';
                        a.click();
                      }}>
                        ⬇ Download Berkas .json
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Kolom Kanan */}
        <section style={S.sidebar}>
          <div style={S.glassCard}>
            <h3 style={S.sectionTitle}>Metrik Jaringan Aktif</h3>
            <div style={S.statGrid}>
              <div style={S.statBox}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Core Engine</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#00D4FF', marginTop: '6px' }}>SnarkJS WASM</div>
              </div>
              <div style={S.statBox}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Kurva Matematika</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#8B5CF6', marginTop: '6px' }}>bn128</div>
              </div>
              <div style={S.statBox}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Privasi Data</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', marginTop: '6px' }}>100% Aman</div>
              </div>
              <div style={S.statBox}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Kategori Sistem</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginTop: '6px' }}>ZK Verification</div>
              </div>
            </div>

            <div style={S.guaranteeBanner}>
              <div style={{ fontSize: '24px' }}>🛡️</div>
              <div>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>Data Nggak Keluar dari Device</strong>
                Semua kalkulasi dilakukan langsung di browser kamu. Nggak ada data mentah atau log aktivitas yang dikirim ke server luar manapun.
              </div>
            </div>
          </div>
        </section>
      </main>

      {status.message && (
        <div style={S.toast}>
          <span style={{ fontSize: '16px' }}>
            {status.type === 'success' ? '⚡' : status.type === 'error' ? '🚨' : '⚙'}
          </span>
          {status.message}
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}