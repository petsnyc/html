# Planet Earth Treasures — Deployment Notes

## Apps Script Web App (Inquiries)

- Purpose: receive inquiry/contact form submissions into a Google Sheet.
- Script file in repo: `inquiries.gs` (copy into Apps Script editor).

### Prerequisites
- A Google account with access to Google Sheets and Apps Script.
- A Google Sheet (or allow the script to create the `Inquiries` sheet tab).
- Spreadsheet ID configured in `inquiries.gs` (`SHEET_ID`).

### Deploy the Web App
1. Open https://script.google.com/ and create a new project.
2. Paste the full contents of `inquiries.gs` into the editor (replace any sample code).
3. Update constants at the top if needed:
   - `SHEET_ID`: your spreadsheet ID.
   - `SHEET_NAME`: default is `Inquiries`.
4. Save the project, then Deploy → New deployment → Select type: Web app.
5. Set “Execute as” to “Me”, and “Who has access” to “Anyone”.
6. Click Deploy and authorize if prompted. Copy the Web app URL.

### Wire the Endpoint in the Site
- Update these constants to the copied Web app URL:
  - `fields/index.html:832` → `INQUIRY_ENDPOINT = "https://script.google.com/.../exec"`
  - `quarries/index.html:618` → `INQUIRY_ENDPOINT = "https://script.google.com/.../exec"`
  - `contact.html:560` → `CONTACT_ENDPOINT = "https://script.google.com/.../exec"` (if using the same endpoint for the contact form)

Notes
- The frontend posts with `mode: "no-cors"` and header `Content-Type: "text/plain;charset=utf-8"` to avoid CORS preflight; the client cannot read the JSON response, which is expected.
- If requests don’t reach the sheet:
  - Ensure deployment access is set to “Anyone”.
  - Make sure you’re using the latest deployment URL (New deployment creates a new URL if you change the type; otherwise Versioning keeps the same `/exec`).
  - Check the Apps Script execution log for errors.

### Quick Test
1. Open the site locally or after publish.
2. On Fields or Quarries, click an “Inquire” button, fill the modal, and submit.
3. Verify a new row appears in the spreadsheet under the `Inquiries` sheet with: Timestamp, Product, Name, Email, Company, Telephone, Message, Source Page, User Agent.

