# Fitur Tambahan: Statistik Voting

## Overview
Fitur ini menambahkan informasi jumlah respons/jumlah vote yang diperoleh pada endpoint `campaigen-voting` dan endpoint baru untuk statistik voting yang lebih detail.

## Perubahan yang Dibuat

### 1. Endpoint `/api/v1/campaigen-voting` (GET)
Endpoint ini sekarang mengembalikan informasi tambahan:
- `total_votes`: Jumlah total unique voters (email yang sudah melakukan voting)
- `vote_count`: Jumlah vote yang diperoleh untuk setiap participant (pada setiap record)
- Data voting dengan pagination seperti sebelumnya

#### Response Structure:
```json
{
  "status": true,
  "message": "Data berhasil diambil",
  "data": {
    "result": [
      {
        "campaigen_voting_id": "uuid-here",
        "campaigen_voting_email": "john@example.com",
        "campaign_participant_id": "participant-uuid",
        "vote_count": 25,  // ← Field baru ini
        "email_employee": "john@example.com",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "count": 10,
    "total_votes": 150
  }
}
```

**Logic Perhitungan `vote_count`:**
- Setiap record voting akan memiliki field `vote_count`
- `vote_count` menunjukkan berapa banyak unique email yang memilih participant tersebut
- **Logic Duplikat Baru**: 
  - **Duplikat = data yang sama di kolom `campaigen_voting_email` DAN `campaign_participant_id`**
  - Jika ada multiple record dengan email dan participant yang sama, hanya hitung 1 (yang terbaru berdasarkan `created_at DESC`)
  - Satu email bisa vote untuk participant yang berbeda (tidak dianggap duplikat)
  - Satu email + satu participant = satu vote (jika ada multiple, ambil yang terbaru)

**Pencegahan Duplikat Data:**
1. **Window Function**: Menggunakan `ROW_NUMBER() OVER (PARTITION BY email, participant_id ORDER BY created_at DESC)` untuk menghindari duplikat kombinasi email+participant
2. **Filter `deleted_at`**: Hanya mengambil record yang `deleted_at` nya `null`
3. **Unique Email Count**: Menggunakan `COUNT(DISTINCT campaigen_voting_email)` untuk menghitung unique voters
4. **Optimasi Query**: Mengambil semua vote count dalam satu query untuk menghindari N+1 problem

**Query Logic Detail:**
```sql
-- 1. Base query dengan window function untuk menghindari duplikat email
SELECT *, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
FROM campaigen_voting 
WHERE deleted_at IS NULL

-- 2. Ambil hanya rn = 1 (latest vote per email)
WHERE rn = 1

-- 3. Hitung vote count per participant (hanya yang tidak di-delete)
-- Logic baru: PARTITION BY email + participant_id untuk menghindari duplikat kombinasi
SELECT 
  v.campaign_participant_id,
  COUNT(DISTINCT v.campaigen_voting_email) as vote_count
FROM (
  SELECT 
    campaign_participant_id,
    campaigen_voting_email,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY campaigen_voting_email, campaign_participant_id 
      ORDER BY created_at DESC
    ) as rn
  FROM campaigen_voting
  WHERE deleted_at IS NULL 
    AND campaigen_voting_email IS NOT NULL
) v
WHERE v.rn = 1
GROUP BY v.campaign_participant_id
```

**Contoh Duplikat yang Dihindari:**
```
Record 1: email="john@example.com", participant_id="A", created_at="2024-01-01 10:00:00"
Record 2: email="john@example.com", participant_id="A", created_at="2024-01-02 15:00:00" ← Hanya ini yang dihitung
Record 3: email="john@example.com", participant_id="B", created_at="2024-01-03 12:00:00" ← Ini tetap dihitung (participant berbeda)
```

### 2. Endpoint Baru `/api/v1/campaigen-voting/stats` (GET)
Endpoint baru ini memberikan statistik voting yang lebih detail:

#### Response Structure:
```json
{
  "status": true,
  "message": "Statistik voting berhasil diambil",
  "data": {
    "total_votes": 150,
    "total_participants": 10,
    "participants_votes": [
      {
        "campaign_participant_id": "uuid-here",
        "vote_count": 45,
        "vote_percentage": 30.0
      }
    ],
    "summary": {
      "total_unique_voters": 150,
      "total_campaign_participants": 10,
      "average_votes_per_participant": 15.0
    }
  }
}
```

#### Fitur:
- **Total Votes**: Jumlah unique email yang sudah melakukan voting
- **Total Participants**: Jumlah total campaign participants
- **Votes per Participant**: Detail vote count dan persentase untuk setiap participant
- **Summary**: Ringkasan statistik termasuk rata-rata votes per participant

### 3. Endpoint `/api/v1/public/voting/participants` (GET)
Endpoint ini juga sudah diupdate untuk mengembalikan `total_votes` dalam response.

## Cara Penggunaan

### 1. Mendapatkan Data Voting dengan Vote Count dan Total Votes
```bash
curl -X 'GET' \
  'http://localhost:9509/api/v1/campaigen-voting' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Response akan berisi:**
- Setiap record voting memiliki `vote_count` yang menunjukkan berapa vote yang diperoleh participant tersebut
- `total_votes` menunjukkan total unique voters secara keseluruhan

### 2. Mendapatkan Statistik Voting Lengkap
```bash
curl -X 'GET' \
  'http://localhost:9509/api/v1/campaigen-voting/stats' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## File yang Dimodifikasi

1. **`src/modules/campaigen_voting/postgre_repository.js`**
   - Menambahkan fungsi `getTotalVotes()`
   - Menambahkan fungsi `getVotingStats()`
   - Memodifikasi fungsi `get()` untuk mengembalikan `total_votes` dan `vote_count` pada setiap record
   - **Optimasi**: Menggunakan single query untuk menghitung semua vote count (menghindari N+1 problem)

2. **`src/modules/campaigen_voting/handler.js`**
   - Menambahkan fungsi `getVotingStats()`

3. **`src/modules/campaigen_voting/index.js`**
   - Menambahkan route `/stats`

4. **`src/static/path/campaigen_voting.json`**
   - Menambahkan dokumentasi API untuk endpoint `/stats`
   - Update dokumentasi endpoint `/campaigen-voting` untuk menunjukkan `vote_count`

## Keuntungan

1. **Informasi Lengkap**: Sekarang bisa melihat total votes yang diperoleh
2. **Vote Count per Record**: Setiap record voting menampilkan berapa vote yang diperoleh participant tersebut
3. **Statistik Detail**: Bisa melihat distribusi vote per participant
4. **Analisis**: Bisa menganalisis performa campaign voting
5. **Monitoring**: Bisa memantau progress voting secara real-time
6. **Konsistensi**: Logic perhitungan sama dengan endpoint participants
7. **Performa**: Optimasi query untuk menghindari N+1 problem
8. **Data Integrity**: Memastikan tidak ada duplikat dan hanya data yang valid

## Catatan Teknis

- **Pencegahan Duplikat**: Menggunakan window function `ROW_NUMBER()` untuk menghindari duplikat kombinasi email+participant_id
- **Filter Deleted**: Semua query menggunakan `WHERE deleted_at IS NULL` untuk memastikan data valid
- **Unique Count**: Menggunakan `COUNT(DISTINCT campaigen_voting_email)` untuk menghitung unique voters
- **Optimasi**: Single query untuk vote count menghindari multiple database calls
- **Logic Duplikat**: 
  - Duplikat = kombinasi yang sama dari `campaigen_voting_email` + `campaign_participant_id`
  - Jika ada multiple record dengan kombinasi yang sama, hanya yang terbaru (`created_at DESC`) yang dihitung
  - Satu email bisa vote untuk participant yang berbeda (tidak dianggap duplikat)
- Total votes dihitung berdasarkan unique email (satu email = satu vote)
- Vote count per participant dihitung berdasarkan unique email yang memilih participant tersebut
- Hanya vote yang tidak di-delete yang dihitung
- Jika ada multiple vote dari email yang sama untuk participant yang sama, hanya yang terbaru yang dihitung
- Persentase dihitung berdasarkan total unique voters
- Data diurutkan berdasarkan jumlah vote terbanyak
