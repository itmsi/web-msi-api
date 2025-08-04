/**
 * Campaign Doctor Truck Handler
 *
 * File Upload Configuration:
 * - Maksimal ukuran file: 1 GB (1024 MB)
 * - Maksimal jumlah file: 10 file
 * - Format yang didukung: PDF dan Image (JPG, PNG, etc.)
 *
 * @param {*} lang this is for consisent with other language message
 * @param {*} repository this is repository for postgres definition
 * @param {*} req express request you can see with console.log(req)
 * @param {*} res express response you can see with console.log(req)
 * @param {*} requestHttp if request condition is and operator, you can use this
 * @return {JSON}
*/

const repository = require('./postgre_repository')
const {
  baseResponse, paginationResponse, requestHttp, paging, decodeToken
} = require('../../utils')
const { generateMinioUpload, generateMinioUploadUpdated } = require('../../utils/minio-upload')

// Helper function untuk mengubah URL MinIO menjadi format MINIO_ENDPOINT_BASE/dir/namafile
const formatMinioUrl = (url) => {
  if (!url) return null;

  // Target base endpoint (new Minio public URL)
  const minioEndpointBase = process.env.MINIO_ENDPOINT_BASE || 'https://minio-bucket.motorsights.com';

  try {
    // Bersihkan jika URL diawali "@"
    const cleanUrl = url.startsWith('@') ? url.slice(1) : url;

    const parsedUrl = new URL(cleanUrl);

    // Ambil path setelah domain
    const path = parsedUrl.pathname.replace(/^\/+/, ''); // hilangkan leading slash

    // Hasil akhir
    return `https://${minioEndpointBase}/${path}`;
  } catch (error) {
    // Kalau bukan URL valid, kembalikan original
    return url;
  }
}

const store = async (req, res) => {
  try {
    const payload = { ...req?.body, ...decodeToken('created', req) }

    // Log request files untuk debugging
    console.log('Request files:', req?.files)
    console.log('Request body:', req?.body)

    // Upload PDF file
    const pdfResult = await generateMinioUpload(req, 0, 'campaign-doctor-truck/pdf', 'pdf')
    payload.participant_file_name_pdf = formatMinioUrl(pdfResult.pathForDatabase) || null

    // Upload Image file
    const imgResult = await generateMinioUpload(req, 1, 'campaign-doctor-truck/images', 'img')
    payload.participant_file_name_img = formatMinioUrl(imgResult.pathForDatabase) || null

    // Log untuk debugging
    console.log('PDF Upload Result:', pdfResult)
    console.log('Image Upload Result:', imgResult)
    console.log('Final Payload:', payload)

    const result = await repository.create(payload);
    console.log('Database result:', result)
    return baseResponse(res, result)
  } catch (error) {
    console.error('Error in store function:', error)
    return baseResponse(res, { success: false, message: 'Error uploading files', error: error.message })
  }
}

// Helper function untuk menambahkan URL ke data (URL sudah statis)
const addFileUrls = (data) => {
  if (!data || !Array.isArray(data)) {
    return data;
  }

  return data.map((item) => {
    if (item.participant_file_name_pdf) {
      item.participant_file_name_pdf_url = item.participant_file_name_pdf;
    }
    if (item.participant_file_name_img) {
      item.participant_file_name_img_url = item.participant_file_name_img;
    }
    return item;
  });
};

const fetch = async (req, res) => {
  try {
    const where = req.query; // dynamicFilterJoin(req, repository.COLUMN)
    const filter = paging(req, repository.DEFAULT_SORT)
    const result = await repository.get(where, filter)

    // Tambahkan URL ke data
    if (result?.data?.result) {
      result.data.result = addFileUrls(result.data.result);
    }

    return paginationResponse(req, res, result)
  } catch (error) {
    console.error('Error in fetch function:', error)
    return baseResponse(res, { success: false, message: 'Error fetching data', error: error.message })
  }
}

const fetchByParam = async (req, res) => {
  try {
    const where = requestHttp(req)
    const result = await repository.getByParam(where)

    // Tambahkan URL ke data
    if (result?.data) {
      const processedData = addFileUrls([result.data]);
      [result.data] = processedData; // Ambil item pertama karena input adalah array
    }

    return baseResponse(res, result)
  } catch (error) {
    console.error('Error in fetchByParam function:', error)
    return baseResponse(res, { success: false, message: 'Error fetching data', error: error.message })
  }
}

const update = async (req, res) => {
  try {
    const where = requestHttp(req)
    let payload = { ...req?.body, type_method: 'update', ...decodeToken('updated', req) }

    if (req?.files) {
      const column = ['participant_file_name_img', 'participant_file_name_pdf']
      const rows = await repository.getByParam(where, column)

      // Perbaiki akses data dan parameter num
      const defImg = { num: 1, path: 'campaign-doctor-truck/images', name: 'img' }
      const defPdf = { num: 0, path: 'campaign-doctor-truck/pdf', name: 'pdf' }

      const defImgRow = {
        column: rows?.data?.participant_file_name_img, payloadName: column[0], payload
      }
      const defPdfRow = {
        column: rows?.data?.participant_file_name_pdf, payloadName: column[1], payload
      }

      // Log untuk debugging
      console.log('Update - Rows data:', rows)
      console.log('Update - DefImgRow:', defImgRow)
      console.log('Update - DefPdfRow:', defPdfRow)

      payload = await generateMinioUploadUpdated(req, defImg, defImgRow)
      payload = await generateMinioUploadUpdated(req, defPdf, defPdfRow)

      // Format URL untuk database setelah upload
      if (payload.participant_file_name_img) {
        payload.participant_file_name_img = formatMinioUrl(payload.participant_file_name_img)
      }
      if (payload.participant_file_name_pdf) {
        payload.participant_file_name_pdf = formatMinioUrl(payload.participant_file_name_pdf)
      }
    }

    const result = await repository.update(where, payload)
    return baseResponse(res, result)
  } catch (error) {
    console.error('Error in update function:', error)
    return baseResponse(res, { success: false, message: 'Error updating files', error: error.message })
  }
}

const softDelete = async (req, res) => {
  const where = requestHttp(req)
  const payload = { type_method: 'soft-delete', ...decodeToken('deleted', req) }
  const result = await repository.update(where, payload, 'participant_description')
  return baseResponse(res, result)
}

const storePublic = async (req, res) => {
  try {
    const payload = { ...req?.body }

    // Log request files untuk debugging
    console.log('Request files:', req?.files)
    console.log('Request body:', req?.body)

    // Upload PDF file
    const pdfResult = await generateMinioUpload(req, 0, 'campaign-doctor-truck/pdf', 'pdf')
    payload.participant_file_name_pdf = formatMinioUrl(pdfResult.pathForDatabase) || null

    // Upload Image file
    const imgResult = await generateMinioUpload(req, 1, 'campaign-doctor-truck/images', 'img')
    payload.participant_file_name_img = formatMinioUrl(imgResult.pathForDatabase) || null

    // Log untuk debugging
    console.log('PDF Upload Result:', pdfResult)
    console.log('Image Upload Result:', imgResult)
    console.log('Final Payload:', payload)

    const result = await repository.create(payload);
    console.log('Database result:', result)
    return baseResponse(res, result)
  } catch (error) {
    console.error('Error in storePublic function:', error)
    return baseResponse(res, { success: false, message: 'Error uploading files', error: error.message })
  }
}

module.exports = {
  store,
  storePublic,
  fetch,
  fetchByParam,
  update,
  softDelete
}
