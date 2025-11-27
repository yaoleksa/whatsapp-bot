function doPost(event) {
  const whatsApp = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("WhatsApp");
  const lastFilledRow = whatsApp.getRange("A:A").getValues().filter(e => e != '').length + 1;
  const data = JSON.parse(event.postData.contents);
  whatsApp.getRange(`A${lastFilledRow}:E${lastFilledRow}`).setValues([
    [
      lastFilledRow - 1,
      new Date(data.time).toISOString(),
      data.from,
      data.to,
      data.body.toString()
    ]
  ]);
  return ContentService.createTextOutput("Success!");
}
