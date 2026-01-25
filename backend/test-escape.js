function escapeMarkdown(text) {
  if (!text) return '';
  return text.replace(/[_*[\]()~`>#+|={}.!-]/g, (s) => `\\${s}`);
}

const title = 'Senior PHP Developer (2500 USD)';
console.log('Original:', title);
console.log('Escaped:', escapeMarkdown(title));
console.log('In message:', `*${escapeMarkdown(title)}*`);
console.log('Full test:');
const msg = `*${escapeMarkdown(title)}*`;
console.log(msg);
