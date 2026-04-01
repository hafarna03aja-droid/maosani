/**
 * Sequential Unlock Logic
 * 
 * Algoritma pure-function untuk menentukan status unlock materi.
 * Terpisah dari store agar bisa diuji secara independen.
 * 
 * ATURAN:
 * 1. Step 1 selalu unlocked
 * 2. Step N terbuka IFF Step N-1 = 'approved'
 * 3. Step 3-4: wajib lulus quiz hafalan 28 huruf (score >= 70)
 * 4. Tajwid (step >= 10): Step 9 harus approved
 * 5. Placement Test bisa meng-override titik mulai
 */

/**
 * Menentukan apakah step bisa diakses
 * @param {number} stepNumber - Nomor step yang ingin diakses
 * @param {Array} progressRecords - Array progress record santri
 * @param {Object} placementResult - Hasil placement test (optional)
 * @returns {boolean}
 */
export function canAccessStep(stepNumber, progressRecords, placementResult = null) {
  // Step 1 selalu accessible
  if (stepNumber === 1) return true;

  // Cek placement test override
  if (placementResult?.recommendedStep) {
    // Placement test membolehkan skip ke step tertentu
    // Tapi step tersebut masih butuh guru approval untuk lanjut ke step berikutnya
    if (stepNumber <= placementResult.recommendedStep) {
      return true;
    }
  }

  // Untuk step reguler (2-9)
  if (stepNumber >= 2 && stepNumber <= 9) {
    const prevStepRecord = progressRecords.find(p => p.stepNumber === stepNumber - 1);
    return prevStepRecord?.status === 'approved';
  }

  // Untuk Tajwid (step >= 10)
  if (stepNumber >= 10) {
    const step9Record = progressRecords.find(p => p.stepNumber === 9);
    return step9Record?.status === 'approved';
  }

  return false;
}

/**
 * Validasi khusus untuk Step 3-4: harus lulus quiz hafalan 28 huruf
 * @param {number} quizScore - Skor quiz hafalan (0-100)
 * @param {number} threshold - Batas minimum kelulusan (default 70)
 * @returns {{ passed: boolean, message: string }}
 */
export function validateHafalanQuiz(quizScore, threshold = 70) {
  if (quizScore >= threshold) {
    return {
      passed: true,
      message: `Alhamdulillah! Skor hafalan: ${quizScore}%. Anda bisa melanjutkan.`,
    };
  }
  return {
    passed: false,
    message: `Skor hafalan: ${quizScore}%. Minimal ${threshold}% untuk melanjutkan. Silakan ulangi latihan.`,
  };
}

/**
 * Menghitung status lengkap roadmap untuk santri
 * @param {Array} allModules - Semua modul pembelajaran
 * @param {Array} progressRecords - Progress records santri
 * @param {Object} placementResult - Hasil placement test
 * @returns {Array} Module dengan status enrichment
 */
export function calculateRoadmap(allModules, progressRecords, placementResult = null) {
  return allModules.map(module => {
    // Cari record progress existing
    const record = progressRecords.find(p => p.stepNumber === module.stepNumber);

    let status;
    if (record) {
      status = record.status;
    } else if (canAccessStep(module.stepNumber, progressRecords, placementResult)) {
      status = 'unlocked';
    } else {
      status = 'locked';
    }

    return {
      ...module,
      status,
      progress: record ? {
        exercisesCompleted: record.exercisesCompleted,
        exercisesTotal: record.exercisesTotal,
        score: record.scoreTotal,
        attempts: record.attempts,
        guruNotes: record.guruNotes,
      } : null,
    };
  });
}

/**
 * Menghitung persentase total progres santri
 * @param {Array} progressRecords - Progress records santri
 * @param {number} totalSteps - Total langkah (default 9)
 * @returns {number} Persentase 0-100
 */
export function calculateOverallProgress(progressRecords, totalSteps = 9) {
  const approvedCount = progressRecords.filter(p =>
    p.status === 'approved' && p.stepNumber <= totalSteps
  ).length;
  return Math.round((approvedCount / totalSteps) * 100);
}

/**
 * Rekomendasi placement test
 * @param {number} score - Total skor quiz (0-100)
 * @returns {{ recommendedStep: number, message: string }}
 */
export function getPlacementRecommendation(score) {
  if (score >= 90) {
    return {
      recommendedStep: 5,
      message: 'MasyaAllah! Anda sudah menguasai huruf dan harakat. Mulai dari Kaidah Panjang.',
    };
  }
  if (score >= 70) {
    return {
      recommendedStep: 3,
      message: 'Bagus! Anda mengenal huruf hijaiyah. Mulai dari Harakat (Vokal).',
    };
  }
  if (score >= 40) {
    return {
      recommendedStep: 2,
      message: 'Anda mengenal sebagian huruf. Mulai dari Huruf Hijaiyah Bagian 2.',
    };
  }
  return {
    recommendedStep: 1,
    message: 'Mari mulai dari awal. InsyaAllah bisa! Bismillah.',
  };
}
