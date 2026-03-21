export function htmlSpecialChars(str) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
  return str.replace(/[&<>"']/g, m => {return map[m];});
}    