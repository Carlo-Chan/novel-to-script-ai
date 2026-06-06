export function highlightYaml(yaml: string): string {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return yaml.split('\n').map((rawLine) => {
    const line = escapeHtml(rawLine);

    // 全行注释或分节标题
    if (/^\s*#/.test(line) || /^---\s*$/.test(line) || /^\.\.\.\s*$/.test(line))
      return '<span class="text-gray-400 dark:text-gray-500 italic">' + line + '</span>';

    // 键值对
    const kv = line.match(/^(\s*)([\w-]+)(:)(\s*)(.*)/);
    if (kv) {
      const indent = kv[1] || '';
      const key = kv[2];
      const colon = kv[3];
      const space = kv[4] || '';
      let val = kv[5] || '';

      let valClass = '';
      if (/^["'].*["']$/.test(val.trim()) || val.trim().includes('#')) valClass = 'text-green-600 dark:text-green-400';
      else if (/^-?\d+(\.\d+)?$/.test(val.trim())) valClass = 'text-amber-600 dark:text-amber-400';
      else if (/^(true|false|yes|no|null|~)$/i.test(val.trim())) valClass = 'text-purple-600 dark:text-purple-400';
      else valClass = 'text-emerald-600 dark:text-emerald-400';

      return indent + '<span class="text-blue-600 dark:text-blue-400 font-semibold">' + key + '</span><span>' + colon + space + '</span><span class="' + valClass + '">' + val + '</span>';
    }

    // 列表项标记
    if (/^\s*-\s/.test(line)) {
      return line.replace(/^(\s*-)/, '<span class="text-amber-600 dark:text-amber-400">$1</span>');
    }

    return line;
  }).join('\n');
};