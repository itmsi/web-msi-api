const getCareerApplyEmailTemplate = (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .info-item { margin-bottom: 10px; }
        .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>New Career Application</h2>
        <div class="info-item">
          <span class="label">Name:</span> ${data.career_apply_name}
        </div>
        <div class="info-item">
          <span class="label">Email:</span> ${data.career_apply_email}
        </div>
        <div class="info-item">
          <span class="label">Phone:</span> ${data.career_apply_phone || 'Not provided'}
        </div>
        <div class="info-item">
          <span class="label">Position:</span> ${data.job_career_name}
        </div>
      </div>
    </body>
    </html>
  `;

module.exports = {
  getCareerApplyEmailTemplate
};
