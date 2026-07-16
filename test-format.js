function formatPlate(raw) {
  if (!raw) return '';
  // Remove all non-alphanumeric
  let s = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  let match = s.match(/^(\d{2}[A-Z][0-9A-Z]?)(\d*)$/);
  if (match) {
    let part1 = match[1];
    let part2 = match[2];
    
    part1 = part1.replace(/^(\d{2})([A-Z])/, '$1-$2');
    
    if (part2) {
      if (part2.length === 5) {
        part2 = part2.slice(0, 3) + '.' + part2.slice(3);
      }
      return part1 + '-' + part2;
    }
    return part1;
  }
  
  return s.replace(/^(\d{2})([A-Z])/, '$1-$2');
}

console.log(formatPlate("99E122268")); // expected: 99-E1-222.68
console.log(formatPlate("30A12345"));  // expected: 30-A-123.45
console.log(formatPlate("51LD1234"));  // expected: 51-LD-1234
console.log(formatPlate("99E1"));      // expected: 99-E1
console.log(formatPlate("99"));        // expected: 99
