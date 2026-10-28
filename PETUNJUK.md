# Biolink MARGA ACT — petunjuk singkat

## Isi folder
- `index.html` — halaman final (HTML+CSS+JS jadi satu, sudah terbungkus/terenkripsi). INI yang di-deploy.
- `vercel.json` — aturan 403 untuk scraper (curl/wget/dll) & jalur terlarang.
- `igneel-ACETE-MARGA.webp` — logo/banner bawaan.
- `jsonbin-awal.json` — isi awal untuk bin JSONBin.
- `_private/` — source terbaca + build.py. JANGAN di-upload ke repo publik (sudah masuk .gitignore).
- **Tambahkan sendiri:** `rimuru_gif.gif` (GIF loader) di folder yang sama dengan `index.html`.

## 1. Siapkan JSONBin (satu kali)
1. Daftar di jsonbin.io → **Create Bin** → tempel isi `jsonbin-awal.json` → set **Public**.
2. Mau lebih dari satu bin (beda akun juga boleh)? Ulangi langkah 1. Semua bin diisi `jsonbin-awal.json`.
3. **API Keys → Create Access Key** dengan izin **Bins Update** (dan Read). Satu key per akun.

## 2. Isi Bin ID di index.html
Cari blok `igneel-config` dekat bagian atas dan ganti:
```
{"bins":[{"id":"6ae1aca2ac6210605a586b89","key":""}]}
```
- 1 bin → sisakan 1 objek. Banyak bin → tambah objek sebanyak apa pun.
- Pengunjung membaca bin **secara acak**; kalau satu gagal otomatis pindah ke bin lain.
- `key` di file hanya untuk membaca bin **Private** (pakai Access Key khusus baca). Biarkan "" untuk bin Public.
- **Jangan** menaruh key tulis / Master Key di file ini — semua orang bisa melihatnya.

## 3. Deploy
GitHub (repo **private** disarankan) → Vercel → Import → Framework "Other", tanpa build command.

## 4. Login pertama
Buka situs → klik logo bulat cepat 3–4x → buat username & password →
tempel Access Key tulis, satu per baris, urutannya sama dengan urutan bin
(satu baris saja = dipakai untuk semua bin; atau format `binId:key`).
Key tersimpan hanya di perangkat itu.

## 5. Mengedit
Dashboard → Editor → ubah apa saja (preview langsung) → **Simpan**.
Tersimpan ke semua bin dan langsung live; tidak perlu deploy ulang. Undo/Redo: Ctrl+Z / Ctrl+Y, Simpan: Ctrl+S.

## 6. Cek proteksi setelah deploy
`curl -I https://domainmu` → harus `403`. Jangan buka DevTools di situs live saat sedang tidak login admin (halaman akan terkunci biru — itu fiturnya).
