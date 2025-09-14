# Email Employee Module

Modul ini menangani operasi CRUD untuk email employee dan fitur import Excel.

## Endpoints

### Admin Endpoints (dengan Bearer Token)
- `POST /api/v1/email-employee` - Membuat data email employee baru
- `GET /api/v1/email-employee` - Mengambil semua data email employee dengan pagination
- `GET /api/v1/email-employee/:email_employee_id` - Mengambil data email employee berdasarkan ID
- `PUT /api/v1/email-employee/:email_employee_id` - Mengupdate data email employee
- `DELETE /api/v1/email-employee/:email_employee_id` - Soft delete data email employee
- `POST /api/v1/email-employee/import` - Import data email employee dari file Excel
- `GET /api/v1/email-employee/template` - Download template Excel untuk import

## Request Body untuk POST

```json
{
  "email_employee_name": "Nama Email Employee",
  "email_employee_email": "email@example.com",
  "email_employee_alias": "alias",
  "email_employee_description": "Deskripsi (opsional)"
}
```

## Import Excel

### Format Excel
File Excel harus memiliki kolom dengan urutan sebagai berikut:
1. **Nama Email Employee** (optional) - Nama lengkap email employee
2. **Email** (optional) - Alamat email yang valid
3. **Alias** (optional) - Alias/nickname email employee
4. **Deskripsi** (optional) - Deskripsi tambahan

### Contoh Format Excel
| Nama Email Employee | Email | Alias | Deskripsi (Opsional) |
|-------------------|-------|-------|---------------------|
| John Doe | john.doe@example.com | john | IT Department |
| Jane Smith | jane.smith@example.com | jane | HR Department |
| | bob.johnson@example.com | bob | Finance Department |
| Alice Brown | | alice | |

### Endpoint Import
```
POST /api/v1/email-employee/import
Content-Type: multipart/form-data

file: [Excel file (.xlsx, .xls)]
```

### Response Import
```json
{
  "status": true,
  "message": "Berhasil mengimport 2 data email employee",
  "data": {
    "success": 2,
    "errors": 0,
    "details": {
      "success": [
        {
          "row": 2,
          "data": {
            "email_employee_id": "uuid"
          },
          "status": "success"
        }
      ],
      "errors": []
    }
  }
}
```

### Error Handling Import
Jika ada error saat import, response akan menampilkan detail error:
```json
{
  "status": false,
  "message": "Import selesai dengan beberapa error",
  "data": {
    "success": 1,
    "errors": 1,
    "details": {
      "success": [...],
      "errors": [
        {
          "row": 3,
          "message": "Email jane.smith@example.com sudah terdaftar"
        }
      ]
    }
  }
}
```

## Validasi

### Endpoint Admin
- `email_employee_name`: String, max 200 karakter, required
- `email_employee_email`: String, email format, max 200 karakter, required
- `email_employee_alias`: String, max 200 karakter, required
- `email_employee_description`: String, optional

### Import Excel
- File harus berformat Excel (.xlsx, .xls)
- Ukuran file maksimal 10 MB
- Header row akan di-skip (baris pertama)
- **Semua field bersifat optional (nullable)**
- Email harus unik jika diisi (tidak boleh duplikat)
- Format email harus valid jika diisi
- Baris kosong akan dilewati
- Minimal satu field harus diisi (nama, email, atau alias)

## Response Format

### Success Response
```json
{
  "status": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "email_employee_id": "uuid"
  }
}
```

### Error Response
```json
{
  "status": false,
  "message": "Error message",
  "data": []
}
```

## Contoh Penggunaan

### Membuat Email Employee Baru
```bash
curl -X POST http://localhost:9512/api/v1/email-employee \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_employee_name": "John Doe",
    "email_employee_email": "john.doe@example.com",
    "email_employee_alias": "john",
    "email_employee_description": "IT Department"
  }'
```

### Import Excel
```bash
curl -X POST http://localhost:9512/api/v1/email-employee/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@email_employee_data.xlsx"
```

### Download Template
```bash
curl -X GET http://localhost:9512/api/v1/email-employee/template \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output template_email_employee.xlsx
```

## Catatan Penting

1. **Email Unik**: Email employee harus unik dalam sistem (jika diisi)
2. **Soft Delete**: Data yang dihapus menggunakan soft delete (tidak benar-benar dihapus dari database)
3. **Transaction**: Import Excel menggunakan transaction untuk memastikan konsistensi data
4. **Error Handling**: Import akan melanjutkan proses meskipun ada error pada beberapa baris
5. **Template**: Template Excel dapat didownload untuk memudahkan pengisian data
6. **Nullable Fields**: Semua field dalam import Excel bersifat optional (nullable)
7. **Empty Rows**: Baris kosong akan dilewati saat import
8. **Partial Data**: Data dapat diimport meskipun hanya mengisi sebagian field 