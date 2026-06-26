// Import langsung dari node_modules (Standar Produksi Vite)
import * as snarkjs from 'snarkjs';

export const generateAgeProof = async (birthYear) => {
  // 1. Definisikan input sirkuit secara lengkap (3 signal sesuai sirkuit baru)
  const circuitInput = { 
    birthYear: birthYear.toString(), 
    currentYear: "2026", 
    ageLimit: "18" 
  };

  console.log("=== DEBUG ZKP FRONTEND ===");
  console.log("Mengirim Input ke Sirkuit Peran A:", circuitInput);

  try {
    // 2. Sesuaikan nama file biner ZKP di folder frontend/public/
    // Jika di folder public namamu 'age_verification.wasm', ganti 'circuit.wasm' di bawah menjadi 'age_verification.wasm'
    const wasmPath = `${window.location.origin}/circuit.wasm`; 
    const zkeyPath = `${window.location.origin}/circuit_final.zkey`;

    // 3. Eksekusi pembuktian menggunakan engine snarkjs lokal
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      wasmPath, 
      zkeyPath
    );

    console.log("ZKP Sukses Generated!");
    
    // 4. Return objek secara lengkap agar bisa dibaca oleh App.jsx
    return { proof, publicSignals, success: true };

  } catch (error) {
    console.error("EROR ASLI DARI ENGINES SNARKJS:", error);
    throw new Error(error.message || "Gagal mengeksekusi komputasi sirkuit ZKP.");
  }
};