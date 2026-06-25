
pragma circom 2.1.6;

// Mengimpor library komparator resmi untuk operasi perbandingan matematika
include "./node_modules/circomlib/circuits/comparators.circom";

template AgeVerification() {
    // 1. SIGNAL INPUT
    signal input birthYear;      // PRIVATE: Rahasia, tidak boleh bocor ke blockchain/frontend
    signal input currentYear;    // PUBLIC: Diketahui oleh pemeriksa
    signal input ageLimit;       // PUBLIC: Batas minimal umur (18)

    // 2. SIGNAL OUTPUT
    signal output isValid;       // PUBLIC: Bernilai 1 jika True (>=18), 0 jika False (<18)

    // 3. LOGIKA INTERNAL
    signal age;
    
    // Menghitung selisih umur
    age <== currentYear - birthYear;

    // Komponen GreaterEqThan dengan kapasitas dekomposisi 8-bit (mendukung angka hingga 255)
    component gte = GreaterEqThan(8);
    
    gte.in[0] <== age;
    gte.in[1] <== ageLimit;

    // Output dari sirkuit diikat dengan output dari komparator
    isValid <== gte.out;
}

// Deklarasikan sinyal mana saja yang bersifat PUBLIC untuk diverifikasi on-chain nanti
component main {public [currentYear, ageLimit]} = AgeVerification();