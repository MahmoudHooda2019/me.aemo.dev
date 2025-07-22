// Dark mode toggle
function toggleDarkMode() {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
}

// Initialize theme
document.body.dataset.theme = localStorage.getItem('theme') || 'light';

// File handling
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', handleFileDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleFileDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
}

function processFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('input').value = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Encode/Decode functions
function encode() {
    const input = document.getElementById('input').value;
    try {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        document.getElementById('output').value = encoded;
    } catch (e) {
        alert('Error encoding text: ' + e.message);
    }
}

function decode() {
    const input = document.getElementById('input').value;
    try {
        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('output').value = decoded;
    } catch (e) {
        alert('Error decoding Base64: ' + e.message);
    }
}

function copyOutput() {
    const output = document.getElementById('output');
    output.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
}

function clearAll() {
    document.getElementById('input').value = '';
    document.getElementById('output').value = '';
    fileInput.value = '';
}