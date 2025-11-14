function doPost(e) {
  const whatsApp = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("WhatsApp");
  const lastFilledRow = Math.max(...whatsApp.getRange("A:A").getValues()) ?
  Math.max(...whatsApp.getRange("A:A").getValues()) + 1 : 2;
  whatsApp.getRange(`E${lastFilledRow}`).setValue(JSON.stringify(e));
  return ContentService.createTextOutput("Success!");
}
