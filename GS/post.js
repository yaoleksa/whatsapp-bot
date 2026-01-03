function doPost(event) {
  const whatsApp = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("WhatsApp");
  const lastFilledRow = whatsApp.getRange("A:A").getValues().filter(e => e != '').length + 1;
  const data = JSON.parse(event.postData.contents);
  // date constants to construct local DateTime string
  const date = new Date(parseInt(data.time) * 1000);
  whatsApp.getRange(`A${lastFilledRow}:E${lastFilledRow}`).setValues([
    [
      lastFilledRow - 1,
      `${date.toLocaleDateString('uk')}T${date.toLocaleTimeString('uk')}`,
      data.from,
      data.to,
      data.body.toString()
    ]
  ]);
  return ContentService.createTextOutput("Success!");
}
