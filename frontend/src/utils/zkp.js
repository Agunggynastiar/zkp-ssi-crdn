// Import langsung dari node_modules (Standar Produksi Vite)
import * as snarkjs from 'snarkjs';

export async function generateAgeProof(birthYear) {
  const currentYear = new Date().getFullYear();

 const circuitInput = {
    birthYear: String(birthYear).trim(),
    currentYear: String(currentYear).trim(),
    ageLimit: "18" 
  };

  console.log("=== DEBUG ZKP FRONTEND ===");
  console.log("Mengirim Input ke Sirkuit Peran A:", circuitInput);

  try {
    const wasmPath = `${window.location.origin}/age_verification.wasm`;
    const zkeyPath = `${window.location.origin}/circuit_final.zkey`;

    // Menggunakan snarkjs lokal, bukan window.snarkjs
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      wasmPath, 
      zkeyPath
    );

    console.log("ZKP Sukses Generated!");
    return { proof, publicSignals, success: true };
  } catch (error) {
    console.error("EROR ASLI DARI ENGINES SNARKJS:", error);
    throw new Error(error.message || "Gagal mengeksekusi komputasi sirkuit ZKP.");
  }
}