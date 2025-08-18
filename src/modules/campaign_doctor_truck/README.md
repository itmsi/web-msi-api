# Campaign Doctor Truck Module

Modul ini menangani operasi CRUD untuk campaign doctor truck.

## Endpoints

### Admin Endpoints (dengan Bearer Token)
- `POST /api/v1/campaign-doctor-truck` - Membuat data campaign doctor truck baru
- `GET /api/v1/campaign-doctor-truck` - Mengambil semua data campaign doctor truck dengan jumlah voting
- `GET /api/v1/campaign-doctor-truck/:campaign_participant_id` - Mengambil data campaign doctor truck berdasarkan ID dengan jumlah voting
- `PUT /api/v1/campaign-doctor-truck/:campaign_participant_id` - Mengupdate data campaign doctor truck
- `DELETE /api/v1/campaign-doctor-truck/:campaign_participant_id` - Soft delete data campaign doctor truck

### Public Endpoints (tanpa Bearer Token)
- `POST /api/v1/public/campaign-doctor-truck/public` - Membuat data campaign doctor truck baru (public access)

## Fitur Voting

Endpoint GET sekarang menampilkan informasi voting untuk setiap participant:

### Field Voting yang Ditambahkan:
- `vote_count`: Jumlah voting yang didapatkan oleh participant ini
- `vote_percentage`: Persentase voting yang didapatkan oleh participant ini (dibulatkan ke 2 desimal)
- `total_votes`: Total voting keseluruhan untuk semua participant

### Logic Voting:
1. **Validasi Soft Delete**: Hanya menghitung voting yang tidak di-soft delete (`deleted_at IS NULL`)
2. **Validasi Duplikasi Email**: Jika ada email yang sama melakukan voting untuk participant yang sama, hanya dihitung yang terakhir masuk berdasarkan `created_at` (ORDER BY DESC)
3. **Perhitungan Persentase**: `(vote_count / total_votes) * 100`

### Contoh Response:
```json
{
  "status": true,
  "message": "Berhasil mendapatkan data",
  "data": [
    {
      "campaign_participant_id": "fdf1e99e-bdc2-402c-a5e9-b2d25209cbfb",
      "participant_name": "Sukirno",
      "participant_company": "MSI",
      "participant_department": "Service",
      "vote_count": 3,
      "vote_percentage": 2.8,
      "total_votes": 107
    }
  ],
  "_meta": {
    "page": 1,
    "limit_per_page": 10,
    "total_page": 4,
    "count_per_page": 10,
    "count_total": 34
  }
}
```

## Request Body untuk POST

```json
{
  "participant_name": "Nama Peserta",
  "participant_phone": "08123456789",
  "participant_company": "Nama Perusahaan",
  "participant_department": "Departemen"
}
```

## File Upload

Endpoint POST mendukung upload file:
- File PDF (index 0) - akan disimpan di `campaign-doctor-truck/pdf`
- File Image (index 1) - akan disimpan di `campaign-doctor-truck/images`

## Validasi

### Endpoint Admin
- `participant_name`: String, max 100 karakter, required
- `participant_phone`: String, max 100 karakter, required
- `participant_company`: String, max 100 karakter, required
- `participant_department`: String, max 100 karakter, required
- `participant_file_name_pdf`: String, max 100 karakter, required
- `participant_file_name_img`: String, max 100 karakter, required

### Endpoint Public
- `participant_name`: String, max 100 karakter, required
- `participant_phone`: String, max 100 karakter, required
- `participant_company`: String, max 100 karakter, required
- `participant_department`: String, max 100 karakter, required
- File upload bersifat opsional

## Perbedaan Endpoint Public vs Admin

- **Endpoint Admin**: Memerlukan Bearer Token, menyimpan informasi `created_by`, file upload wajib
- **Endpoint Public**: Tidak memerlukan Bearer Token, tidak menyimpan informasi `created_by`, file upload opsional

## Database Schema

### Tabel Utama: `mst_campaign_participant`
- `campaign_participant_id` (Primary Key)
- `participant_name`
- `participant_phone`
- `participant_company`
- `participant_department`
- `participant_description`
- `participant_file_name_pdf`
- `participant_file_name_img`
- `participant_location`
- `created_at`, `created_by`
- `updated_at`, `updated_by`
- `deleted_at`, `deleted_by`

### Tabel Voting: `mst_campaigen_voting`
- `campaigen_voting_id` (Primary Key)
- `campaign_participant_id` (Foreign Key)
- `campaigen_voting_email`
- `created_at`, `created_by`
- `deleted_at`, `deleted_by`

## Catatan Teknis

- Voting dihitung secara real-time setiap kali endpoint diakses
- Logic voting menggunakan window function `ROW_NUMBER()` untuk menghindari duplikasi
- Soft delete tidak mempengaruhi perhitungan voting
- Persentase dibulatkan ke 2 desimal untuk akurasi 

# Campaign Doctor Truck API

## Endpoint: GET /api/v1/campaign-doctor-truck

### Deskripsi
Endpoint untuk mengambil data campaign doctor truck dengan default sorting berdasarkan vote count tertinggi.

### Parameter Query
- `limit` (optional): Jumlah data per halaman (default: 10)
- `page` (optional): Nomor halaman (default: 1)
- `search` (optional): Pencarian berdasarkan nama, phone, company, department, atau description

### Contoh Request

#### Request dengan limit 100:
```bash
curl -X 'GET' \
  'http://localhost:9509/api/v1/campaign-doctor-truck?limit=100' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Request dengan pencarian:
```bash
curl -X 'GET' \
  'http://localhost:9509/api/v1/campaign-doctor-truck?limit=100&search=nama_participant' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Response Format
```json
{
  "status": true,
  "message": "Data berhasil diambil",
  "data": {
    "result": [
      {
        "campaign_participant_id": "uuid",
        "participant_name": "Nama Participant",
        "participant_phone": "08123456789",
        "participant_company": "Nama Perusahaan",
        "participant_department": "Departemen",
        "participant_description": "Deskripsi",
        "participant_file_name_pdf": "url_pdf",
        "participant_file_name_img": "url_image",
        "participant_location": "Lokasi",
        "created_at": "2024-01-01T00:00:00.000Z",
        "vote_count": 150,
        "vote_percentage": 25.5,
        "total_votes": 588
      }
    ],
    "count": 100,
    "total_votes": 588
  }
}
```

### Fitur Tambahan
- **vote_count**: Jumlah voting yang diterima participant
- **vote_percentage**: Persentase voting dari total keseluruhan
- **total_votes**: Total voting keseluruhan campaign

### Default Sorting
- **Data secara otomatis diurutkan berdasarkan `vote_count` tertinggi**
- Participant dengan vote count tertinggi akan muncul di urutan pertama
- Tidak perlu parameter tambahan untuk mengaktifkan sorting ini

### Catatan
- Semua data yang di-soft delete tidak akan ditampilkan
- Sorting berdasarkan vote count dilakukan setelah data diambil dari database
- Persentase voting dibulatkan ke 2 desimal untuk akurasi 