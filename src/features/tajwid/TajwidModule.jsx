/**
 * Tajwid Module — Materi Tajwid Selembar
 * Hanya bisa diakses setelah Step 9 disetujui guru
 * 
 * Topik: Hukum Nun Sukun/Tanwin, Hukum Mim Sukun, Hukum Mad, Qalqalah
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useProgressStore from '../../store/progressStore';
import { TAJWID_MODULES } from '../../data/modules';
import { Card, Badge, Button, Modal } from '../../components/ui';
import './tajwid.css';

/** Tajwid content per module */
const TAJWID_CONTENT = {
  'tajwid-1': {
    title: 'Hukum Nun Sukun & Tanwin',
    sections: [
      {
        name: 'Izhar Halqi',
        nameAr: 'إظهار حلقي',
        description: 'Nun sukun/tanwin dibaca jelas tanpa ghunnah saat bertemu huruf halqi.',
        letters: 'ء هـ ع ح غ خ',
        color: 'var(--blue-400)',
        examples: [
          { text: 'مِنْ عِلْمٍ', rule: 'Nun sukun + ع = Izhar' },
          { text: 'مَنْ حَكَمَ', rule: 'Nun sukun + ح = Izhar' },
        ],
      },
      {
        name: 'Idgham',
        nameAr: 'إدغام',
        description: 'Nun sukun/tanwin dilebur ke huruf berikutnya.',
        letters: 'ي ر م ل و ن',
        color: 'var(--success)',
        subTypes: [
          { name: 'Bi Ghunnah (يَرْمَلُون)', desc: 'Dengan dengung — ي ن م و' },
          { name: 'Bila Ghunnah', desc: 'Tanpa dengung — ل ر' },
        ],
        examples: [
          { text: 'مِنْ يَّعْمَل', rule: 'Nun sukun + ي = Idgham bi ghunnah' },
          { text: 'مِنْ رَّبِّهِمْ', rule: 'Nun sukun + ر = Idgham bila ghunnah' },
        ],
      },
      {
        name: 'Iqlab',
        nameAr: 'إقلاب',
        description: 'Nun sukun/tanwin berubah menjadi Mim saat bertemu Ba.',
        letters: 'ب',
        color: 'var(--gold-400)',
        examples: [
          { text: 'مِنۢ بَعْدِ', rule: 'Nun sukun + ب = Iqlab (nun → mim)' },
          { text: 'سَمِيعٌۢ بَصِير', rule: 'Tanwin + ب = Iqlab' },
        ],
      },
      {
        name: 'Ikhfa Haqiqi',
        nameAr: 'إخفاء حقيقي',
        description: 'Nun sukun/tanwin dibaca samar (antara izhar dan idgham) dengan ghunnah.',
        letters: 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك',
        color: 'var(--red-400)',
        examples: [
          { text: 'مِنْ قَبْلِ', rule: 'Nun sukun + ق = Ikhfa' },
          { text: 'اَنْتُمْ', rule: 'Nun sukun + ت = Ikhfa' },
        ],
      },
    ],
  },
  'tajwid-2': {
    title: 'Hukum Mim Sukun',
    sections: [
      {
        name: 'Ikhfa Syafawi',
        nameAr: 'إخفاء شفوي',
        description: 'Mim sukun dibaca samar saat bertemu Ba.',
        letters: 'ب',
        color: 'var(--gold-400)',
        examples: [
          { text: 'تَرْمِيهِمْ بِحِجَارَةٍ', rule: 'Mim sukun + ب = Ikhfa Syafawi' },
        ],
      },
      {
        name: 'Idgham Mimi / Mutamasilain',
        nameAr: 'إدغام متماثلين',
        description: 'Mim sukun bertemu Mim — dilebur menjadi satu mim panjang.',
        letters: 'م',
        color: 'var(--success)',
        examples: [
          { text: 'لَهُمْ مَّا يَشَاءُونَ', rule: 'Mim sukun + م = Idgham Mimi' },
        ],
      },
      {
        name: 'Izhar Syafawi',
        nameAr: 'إظهار شفوي',
        description: 'Mim sukun dibaca jelas saat bertemu huruf selain Ba dan Mim.',
        letters: '26 huruf lainnya',
        color: 'var(--blue-400)',
        examples: [
          { text: 'أَنْعَمْتَ', rule: 'Mim sukun + ت = Izhar Syafawi' },
        ],
      },
    ],
  },
  'tajwid-3': {
    title: 'Hukum Mad (Panjang)',
    sections: [
      {
        name: "Mad Thabi'i (Asli)",
        nameAr: 'مد طبيعي',
        description: 'Mad dasar — panjang 2 harakat. Terjadi saat huruf mad tanpa hambatan.',
        letters: 'ا و ي',
        color: 'var(--blue-400)',
        examples: [
          { text: 'قَالَ', rule: 'Alif setelah fathah = 2 harakat' },
          { text: 'يَقُولُ', rule: 'Waw setelah dhammah = 2 harakat' },
        ],
      },
      {
        name: 'Mad Wajib Muttashil',
        nameAr: 'مد واجب متصل',
        description: 'Huruf mad bertemu hamzah dalam satu kata — 4-5 harakat.',
        color: 'var(--red-400)',
        examples: [
          { text: 'جَاءَ', rule: 'Alif + hamzah dalam 1 kata = 4-5 harakat' },
          { text: 'سِيءَ', rule: 'Ya + hamzah dalam 1 kata' },
        ],
      },
      {
        name: 'Mad Jaiz Munfashil',
        nameAr: 'مد جائز منفصل',
        description: 'Huruf mad di akhir kata bertemu hamzah di awal kata berikutnya — 2-5 harakat.',
        color: 'var(--gold-400)',
        examples: [
          { text: 'فِي أَنْفُسِهِمْ', rule: 'Ya akhir kata + Alif awal kata' },
          { text: 'قَالُوا آمَنَّا', rule: 'Waw akhir kata + Alif awal kata' },
        ],
      },
      {
        name: "Mad 'Aridh Lis-Sukun",
        nameAr: 'مد عارض للسكون',
        description: 'Mad sebelum huruf akhir yang diwaqafkan (dihentikan) — 2-6 harakat.',
        color: 'var(--success)',
        examples: [
          { text: 'ٱلْعَـٰلَمِينَ ۝', rule: 'Waqaf di akhir ayat = 2-6 harakat' },
        ],
      },
    ],
  },
  'tajwid-4': {
    title: 'Qalqalah & Lainnya',
    sections: [
      {
        name: 'Qalqalah Sughra',
        nameAr: 'قلقلة صغرى',
        description: 'Pantulan ringan pada huruf Qalqalah yang mati di tengah kata.',
        letters: 'ق ط ب ج د',
        color: 'var(--blue-400)',
        examples: [
          { text: 'يَقْطَعُونَ', rule: 'Qaf mati di tengah = Qalqalah sughra' },
          { text: 'أَبْصَارِهِمْ', rule: 'Ba mati di tengah = Qalqalah sughra' },
        ],
      },
      {
        name: 'Qalqalah Kubra',
        nameAr: 'قلقلة كبرى',
        description: 'Pantulan kuat pada huruf Qalqalah yang mati di akhir kata/waqaf.',
        letters: 'ق ط ب ج د',
        color: 'var(--red-400)',
        examples: [
          { text: 'ٱلْفَلَقِ ۝', rule: 'Qaf mati di akhir = Qalqalah kubra' },
          { text: 'مَسَدٍ ۝', rule: 'Dal mati di akhir = Qalqalah kubra' },
        ],
      },
      {
        name: 'Waqaf & Ibtida',
        nameAr: 'الوقف والإبتداء',
        description: 'Tanda berhenti dan memulai bacaan kembali dengan benar.',
        color: 'var(--gold-400)',
        examples: [
          { text: 'مـ', rule: 'Waqaf Lazim — wajib berhenti' },
          { text: 'قلي', rule: 'Waqaf lebih baik berhenti' },
          { text: 'صلي', rule: 'Waqaf lebih baik sambung' },
          { text: 'لا', rule: 'Tidak boleh berhenti' },
        ],
      },
    ],
  },
};

export default function TajwidModule() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getStepStatus } = useProgressStore();
  const [selectedModule, setSelectedModule] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  // Check if step 9 is approved
  const step9Status = getStepStatus(user?.id, 9);
  const isUnlocked = step9Status === 'approved';

  if (!isUnlocked) {
    return (
      <div className="tajwid-page">
        <motion.div
          className="tajwid-locked"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="tajwid-locked-icon">🔒</span>
          <h1>Modul Tajwid Terkunci</h1>
          <p>Selesaikan 9 Langkah Bisa Baca Al-Qur'an dan dapatkan persetujuan Guru untuk membuka modul Tajwid.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/roadmap')}>
            🗺️ Lihat Peta Belajar
          </Button>
        </motion.div>
      </div>
    );
  }

  const content = selectedModule ? TAJWID_CONTENT[selectedModule.id] : null;

  return (
    <div className="tajwid-page">
      <motion.div
        className="tajwid-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {selectedModule && (
          <button className="learning-back" onClick={() => setSelectedModule(null)}>← Kembali</button>
        )}
        <h1>📜 TAJWID Metode Selembar</h1>
        <p>Hukum-hukum bacaan Al-Qur'an tingkat lanjut</p>
      </motion.div>

      {/* Module selection grid */}
      {!selectedModule && (
        <div className="tajwid-grid stagger-children">
          {TAJWID_MODULES.map(mod => (
            <Card
              key={mod.id}
              variant="elevated"
              padding="lg"
              className="tajwid-module-card"
              onClick={() => setSelectedModule(mod)}
            >
              <span className="tajwid-module-icon">{mod.icon}</span>
              <h3>{mod.title}</h3>
              <p className="arabic-ui" style={{ color: 'var(--blue-300)', fontSize: '1.1rem' }}>{mod.titleAr}</p>
              <p className="tajwid-module-desc">{mod.description}</p>
              <div className="tajwid-module-topics">
                {mod.subTopics?.map(t => (
                  <Badge key={t} variant="blue" size="sm">{t}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Module Detail Content */}
      {selectedModule && content && (
        <motion.div
          className="tajwid-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="tajwid-content-title">{content.title}</h2>

          <div className="tajwid-sections">
            {content.sections.map((section, idx) => {
              const isExpanded = expandedSection === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    variant={isExpanded ? 'glow' : 'elevated'}
                    padding="md"
                    className="tajwid-section-card"
                  >
                    <div
                      className="tajwid-section-header"
                      onClick={() => setExpandedSection(isExpanded ? null : idx)}
                    >
                      <div className="tajwid-section-color" style={{ background: section.color }} />
                      <div className="tajwid-section-info">
                        <h3>{section.name}</h3>
                        {section.nameAr && <span className="arabic-ui">{section.nameAr}</span>}
                      </div>
                      <span className="tajwid-section-toggle">{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="tajwid-section-body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <p className="tajwid-section-desc">{section.description}</p>

                          {section.letters && (
                            <div className="tajwid-section-letters">
                              <span className="tajwid-letters-label">Huruf:</span>
                              <span className="arabic-ui tajwid-letters-chars">{section.letters}</span>
                            </div>
                          )}

                          {section.subTypes && (
                            <div className="tajwid-subtypes">
                              {section.subTypes.map((st, si) => (
                                <div key={si} className="tajwid-subtype">
                                  <strong>{st.name}</strong>
                                  <span>{st.desc}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="tajwid-examples">
                            <h4>Contoh:</h4>
                            {section.examples.map((ex, ei) => (
                              <div key={ei} className="tajwid-example-item">
                                <span className="arabic" style={{ fontSize: '1.5rem', color: section.color }}>
                                  {ex.text}
                                </span>
                                <span className="tajwid-example-rule">{ex.rule}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
