// ====== CONFIG ======
const SHEET_ID = '1AgPJ-LmP_UbWLmAwt9B1pm7mEoQ-OFLgliLGLdr3swM'; // File > Share > Copy link -> the long ID
const SHEET_NAME = 'Inquiries';

// ====== WEB APP HANDLER ======
function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Ensure header once (matches updated fields)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Product',
        'Name',
        'Email',
        'Company',
        'Telephone',
        'Message',
        'Source Page',
        'User Agent',
      ]);
    }

    sheet.appendRow([
      new Date(),
      data.product || '',
      data.name || '',
      data.email || '',
      data.company || '',
      data.phone || '',
      data.message || '',
      data.sourcePage || '',
      data.userAgent || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

