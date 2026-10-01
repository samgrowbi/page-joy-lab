/**
 * Pearl Med Spa — Waitlist → Google Sheet
 *
 * Setup:
 * 1. Create a Google Sheet. Extensions → Apps Script. Paste this file.
 * 2. Project Settings → Script properties → add WAITLIST_SECRET = <long random string>
 *    (the same value goes into the Supabase secret WAITLIST_SHEET_SECRET).
 * 3. Deploy → New deployment → Web app.
 *      Execute as: Me    Who has access: Anyone
 *    Copy the /exec URL into the Supabase secret WAITLIST_SHEET_WEBHOOK_URL.
 * 4. After editing this script, Deploy → Manage deployments → edit → New version
 *    (otherwise the old code keeps running at the same URL).
 */

const SHEET_NAME = 'Waitlist';
const HEADERS = [
  'Submitted At', 'First Name', 'Last Name', 'Email', 'Phone',
  'Preferred Date', 'Preferred Time', 'Treatment', 'Source URL', 'Entry ID',
];

function doPost(e) {
  const out = (obj) =>
    ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);

  try {
    const data = JSON.parse(e.postData.contents);
    const expected = PropertiesService.getScriptProperties().getProperty('WAITLIST_SECRET');
    if (!expected || data.secret !== expected) return out({ ok: false, error: 'unauthorized' });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getSheet_();

      // Idempotent: skip if this entry ID is already in the sheet (retries).
      const idCol = HEADERS.indexOf('Entry ID') + 1;
      const last = sheet.getLastRow();
      if (last > 1 && data.id) {
        const ids = sheet.getRange(2, idCol, last - 1, 1).getValues().flat();
        if (ids.indexOf(data.id) !== -1) return out({ ok: true, duplicate: true });
      }

      sheet.appendRow([
        data.submittedAt ? new Date(data.submittedAt) : new Date(),
        safe_(data.firstName),
        safe_(data.lastName),
        safe_(data.email),
        safe_(data.phone), // safe_ prefixes an apostrophe so "+1..." stays text
        safe_(data.preferredDate),
        safe_(data.preferredTime),
        safe_(data.treatment),
        safe_(data.sourceUrl),
        safe_(data.id),
      ]);
    } finally {
      lock.releaseLock();
    }
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

// Stop spreadsheet formula injection (=, +, -, @ at the start of a cell).
function safe_(v) {
  const s = v == null ? '' : String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
