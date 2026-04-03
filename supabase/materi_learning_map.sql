-- ============================================================
-- MAOSANI: Inisialisasi Tabel Materi Belajar & Seed Data
-- ============================================================

-- 1. Buat Tabel Materi Belajar (jika belum ada)
CREATE TABLE IF NOT EXISTS public.materi_belajar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT,
    category TEXT CHECK (category IN ('hijaiyah', 'tajwid', 'umum')),
    icon TEXT,
    audio_url TEXT, -- Kolom untuk URL audio dari Supabase Storage
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Aktifkan RLS agar dapat dibaca publik
ALTER TABLE public.materi_belajar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Materi: baca publik" ON public.materi_belajar;
CREATE POLICY "Materi: baca publik" ON public.materi_belajar FOR SELECT USING (true);

-- 3. Bersihkan data lama jika ingin melakukan reset (opsional)
-- TRUNCATE TABLE public.materi_belajar;

-- 4. Masukkan Seed Data (9 Langkah Hijaiyah + 4 Modul Tajwid)
INSERT INTO public.materi_belajar (step_number, title, title_ar, description, category, icon)
VALUES
    (1, 'Mengenal Huruf Hijaiyah (Bagian 1)', 'تعرّف على الحروف الهجائية', 'Mengenal 14 huruf hijaiyah pertama (Alif - Zay) dengan teknik staccato/terputus.', 'hijaiyah', '🔤'),
    (2, 'Mengenal Huruf Hijaiyah (Bagian 2)', 'الحروف الهجائية - الجزء الثاني', 'Mengenal 14 huruf hijaiyah berikutnya (Sin - Ya) dan animasi huruf bersambung dari kanan.', 'hijaiyah', '🔡'),
    (3, 'Harakat (Vokal)', 'الحَرَكَات', 'Fathah, Kasrah, Dhammah — bunyi vokal dasar. WAJIB hafal 28 huruf.', 'hijaiyah', 'َ'),
    (4, 'Tanwin (Nunasi)', 'التَنْوِين', 'Fathatain, Kasratain, Dhammatain — huruf berbunyi "N" di akhir.', 'hijaiyah', 'ً'),
    (5, 'Kaidah Panjang (Mad Asli)', 'المَدّ الأصلي', 'Huruf mad (Alif, Waw, Ya) dengan nada stabil 2 harakat.', 'hijaiyah', '📏'),
    (6, 'Kaidah Panjang Lanjutan', 'المَدّ الفرعي', 'Mad Far''i dengan "nada ayunan" 4-6 harakat.', 'hijaiyah', '🎵'),
    (7, 'Huruf Sukun (Mati)', 'السُّكُون', 'Transisi dari huruf hidup ke huruf mati (sukun). Pengenalan kata hidup-mati.', 'hijaiyah', '⏹️'),
    (8, 'Huruf Tasydid (Syaddah)', 'التَّشْدِيد', 'Huruf bertasydid — audio lancar tanpa putus untuk huruf ganda.', 'hijaiyah', 'ّ'),
    (9, 'Lafadz Allah & Kaidah Khusus', 'لفظ الجلالة', 'Aturan tebal-tipis pada Lafadz Allah. Warna ketebalan visual.', 'hijaiyah', '🕌'),
    (10, 'Hukum Nun Sukun & Tanwin', 'أحكام النون الساكنة والتنوين', 'Izhar, Idgham, Iqlab, Ikhfa', 'tajwid', 'ن'),
    (11, 'Hukum Mim Sukun', 'أحكام الميم الساكنة', 'Ikhfa Syafawi, Idgham Mimi, Izhar Syafawi', 'tajwid', 'م'),
    (12, 'Hukum Mad (Panjang)', 'أحكام المَدّ', 'Mad Thabi''i, Mad Wajib, Mad Jaiz, Mad Lazim, dll.', 'tajwid', '📐'),
    (13, 'Hukum Qalqalah & Lainnya', 'القلقلة وغيرها', 'Qalqalah Sughra & Kubra, Waqaf & Ibtida', 'tajwid', '💫')
ON CONFLICT (step_number) 
DO UPDATE SET 
    title = EXCLUDED.title,
    title_ar = EXCLUDED.title_ar,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    updated_at = now();

-- 5. Berikan instruksi pengisian audio_url
-- Anda dapat mengisi audio_url secara manual via dashboard Supabase 
-- atau menarik URL dari Storage menggunakan format: 
-- https://[PROJECT_ID].supabase.co/storage/v1/object/public/audio-pembelajaran/[FILE_NAME].mp3
