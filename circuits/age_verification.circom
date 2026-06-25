pragma circom 2.1.6;

include "./node_modules/circomlib/circuits/comparators.circom";

template AgeVerification() {
    signal input birthYear;      
    signal input currentYear;    
    signal input ageLimit;       

    // Kita tidak perlu signal output 'isValid' lagi, karena kalau tidak valid, 
    // sirkuit akan langsung ERROR dan menolak membuat proof.
    
    signal age;

    // 1. Mencegah Underflow (Tahun Lahir TIDAK BOLEH lebih dari Tahun Sekarang)
    // Komponen LessEqThan memastikan birthYear <= currentYear
    component checkFuture = LessEqThan(16);
    checkFuture.in[0] <== birthYear;
    checkFuture.in[1] <== currentYear;
    checkFuture.out === 1; // MEMAKSA HARUS TRUE

    // 2. Menghitung umur
    age <== currentYear - birthYear;

    // 3. Memeriksa Batas Umur
    component gte = GreaterEqThan(8);
    gte.in[0] <== age;
    gte.in[1] <== ageLimit;

    // MEMAKSA hasil komparasi HARUS 1 (True). Jika di bawah umur, proof gagal dibuat!
    gte.out === 1; 
}

component main {public [currentYear, ageLimit]} = AgeVerification();