# Campaign Doctor Truck Module

Modul ini menangani operasi CRUD untuk campaign doctor truck.

## Endpoints

### Admin Endpoints (dengan Bearer Token)
- `POST /api/v1/campaign-doctor-truck` - Membuat data campaign doctor truck baru
- `GET /api/v1/campaign-doctor-truck` - Mengambil semua data campaign doctor truck
- `GET /api/v1/campaign-doctor-truck/:campaign_participant_id` - Mengambil data campaign doctor truck berdasarkan ID
- `PUT /api/v1/campaign-doctor-truck/:campaign_participant_id` - Mengupdate data campaign doctor truck
- `DELETE /api/v1/campaign-doctor-truck/:campaign_participant_id` - Soft delete data campaign doctor truck

### Public Endpoints (tanpa Bearer Token)
- `POST /api/v1/public/campaign-doctor-truck/public` - Membuat data campaign doctor truck baru (public access)

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

- **Endpoint Public**: Tidak memerlukan Bearer Token, tidak menyimpan informasi `created_by`, file upload opsional
- **Endpoint Admin**: Memerlukan Bearer Token, menyimpan informasi `created_by` dari token, file name required

## Response Format

```json
{
  "status": true,
  "message": "Data baru berhasil ditambahkan",
  "data": {
    "campaign_participant_id": "uuid"
  }
}
```

## Contoh Penggunaan

### Endpoint Public (tanpa Bearer Token)
```bash
# Tanpa file upload
curl -X POST http://localhost:9512/api/v1/public/campaign-doctor-truck/public \
  -H "Content-Type: multipart/form-data" \
  -F "participant_name=publick customer" \
  -F "participant_phone=08123456789" \
  -F "participant_company=Perusahaan Test" \
  -F "participant_department=IT"

# Dengan file upload
curl -X POST http://localhost:9512/api/v1/public/campaign-doctor-truck/public \
  -H "Content-Type: multipart/form-data" \
  -F "participant_name=publick customer" \
  -F "participant_phone=08123456789" \
  -F "participant_company=Perusahaan Test" \
  -F "participant_department=IT" \
  -F "file1=@document.pdf" \
  -F "file2=@image.jpg"
```

### Endpoint Admin (dengan Bearer Token)
```bash
curl -X POST http://localhost:9512/api/v1/campaign-doctor-truck \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "participant_name=admin customer" \
  -F "participant_phone=08123456789" \
  -F "participant_company=Perusahaan Test" \
  -F "participant_department=IT" \
  -F "participant_file_name_pdf=document.pdf" \
  -F "participant_file_name_img=image.jpg" \
  -F "file1=@document.pdf" \
  -F "file2=@image.jpg"
``` 