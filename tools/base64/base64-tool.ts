// Base64 Encode & Decode Tool
// @ts-check

// Dark mode toggle
function toggleDarkMode(): void {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'true' : 'false');
}

// Initialize dark mode from localStorage
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }

  // Setup drag and drop
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });
  }
});

// Handle file upload
function handleFile(file: File): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    const input = document.getElementById('input') as HTMLTextAreaElement | null;
    if (input && e.target?.result) {
      // Convert to base64
      const base64 = btoa(e.target.result as string);
      input.value = base64;
    }
  };
  reader.readAsBinaryString(file);
}

// Encode text to Base64
function encode(): void {
  const input = document.getElementById('input') as HTMLTextAreaElement | null;
  const output = document.getElementById('output') as HTMLTextAreaElement | null;

  if (!input || !output) return;

  try {
    const text = input.value;
    const encoded = btoa(text);
    output.value = encoded;
  } catch (err) {
    output.value = 'Error: Unable to encode. Input may contain invalid characters.';
  }
}

// Decode Base64 to text
function decode(): void {
  const input = document.getElementById('input') as HTMLTextAreaElement | null;
  const output = document.getElementById('output') as HTMLTextAreaElement | null;

  if (!input || !output) return;

  try {
    const text = input.value;
    const decoded = atob(text);
    output.value = decoded;
  } catch (err) {
    output.value = 'Error: Invalid Base64 string.';
  }
}

// Copy output to clipboard
async function copyOutput(): Promise<void> {
  const output = document.getElementById('output') as HTMLTextAreaElement | null;
  if (!output || !output.value) return;

  try {
    await navigator.clipboard.writeText(output.value);
    alert('Copied to clipboard!');
  } catch (err) {
    // Fallback
    output.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
  }
}

// Clear all fields
function clearAll(): void {
  const input = document.getElementById('input') as HTMLTextAreaElement | null;
  const output = document.getElementById('output') as HTMLTextAreaElement | null;

  if (input) input.value = '';
  if (output) output.value = '';
}

// Expose functions to global scope for HTML onclick handlers
(window as unknown as Record<string, unknown>).toggleDarkMode = toggleDarkMode;
(window as unknown as Record<string, unknown>).encode = encode;
(window as unknown as Record<string, unknown>).decode = decode;
(window as unknown as Record<string, unknown>).copyOutput = copyOutput;
(window as unknown as Record<string, unknown>).clearAll = clearAll;
