export function paymentCsv(rows: unknown[][]) {
  return "\uFEFF"+rows.map(row=>row.map(value=>{
    let text=String(value??"");
    if(/^[\s]*[=+@\-\t\r]/.test(text)) text="'"+text;
    return `"${text.replaceAll('"','""')}"`;
  }).join(",")).join("\r\n");
}
