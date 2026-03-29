// DeepLink Extension Generator Tool
// @ts-check

declare const JSZip: typeof import('jszip');
declare const saveAs: (blob: Blob, filename: string) => void;
declare const Prism: {
  highlight: (code: string, grammar: unknown, language: string) => string;
  languages: Record<string, unknown>;
};

interface DeepLinkEntry {
  scheme: string;
  host: string;
  path: string;
  params: string;
}

let entryCount = 0;
const entries: Map<number, DeepLinkEntry> = new Map();

// Dark mode toggle
function toggleDarkMode(): void {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'true' : 'false');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }
  
  // Add initial form entry
  addFormEntry();
  updateManifestPreview();
});

// Add a new form entry
function addFormEntry(): void {
  entryCount++;
  const form = document.getElementById('form');
  if (!form) return;

  const entryDiv = document.createElement('div');
  entryDiv.className = 'form-entry';
  entryDiv.dataset.entryId = entryCount.toString();

  entryDiv.innerHTML = `
    <div class="input-row">
      <label>Scheme:</label>
      <input type="text" class="scheme-input" placeholder="e.g., myapp" data-field="scheme">
    </div>
    <div class="input-row">
      <label>Host:</label>
      <input type="text" class="host-input" placeholder="e.g., open" data-field="host">
    </div>
    <div class="input-row">
      <label>Path:</label>
      <input type="text" class="path-input" placeholder="e.g., /page" data-field="path">
    </div>
    <div class="input-row">
      <label>Params:</label>
      <input type="text" class="params-input" placeholder="e.g., id=123" data-field="params">
    </div>
    <button type="button" class="remove-btn" onclick="removeEntry(${entryCount})">×</button>
  `;

  form.appendChild(entryDiv);
  
  // Add input listeners for preview
  const inputs = entryDiv.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', updateManifestPreview);
  });
}

// Remove a form entry
function removeEntry(id: number): void {
  const entry = document.querySelector(`[data-entry-id="${id}"]`);
  if (entry) {
    entry.remove();
    entries.delete(id);
    updateManifestPreview();
  }
}

// Collect all form entries
function collectEntries(): DeepLinkEntry[] {
  const formEntries = document.querySelectorAll('.form-entry');
  const result: DeepLinkEntry[] = [];

  formEntries.forEach(entry => {
    const scheme = (entry.querySelector('.scheme-input') as HTMLInputElement)?.value || '';
    const host = (entry.querySelector('.host-input') as HTMLInputElement)?.value || '';
    const path = (entry.querySelector('.path-input') as HTMLInputElement)?.value || '';
    const params = (entry.querySelector('.params-input') as HTMLInputElement)?.value || '';

    if (scheme && host) {
      result.push({ scheme, host, path, params });
    }
  });

  return result;
}

// Generate Android manifest XML
function generateManifest(entries: DeepLinkEntry[]): string {
  let activities = '';
  
  entries.forEach(entry => {
    const scheme = entry.scheme;
    const host = entry.host;
    const path = entry.path || '.*';
    const port = '.*';
    
    activities += `    <activity android:name=".${scheme}_${host}_Activity">
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="${scheme}" android:host="${host}" android:pathPattern="${path}" android:port="${port}" />
        </intent-filter>
    </activity>
`;
  });

  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
${activities}</manifest>`;
}

// Generate component source file
function generateComponent(entry: DeepLinkEntry): string {
  const className = `${entry.scheme}_${entry.host}_Activity`.replace(/[^a-zA-Z0-9_]/g, '_');
  
  return `package com.aemo.deeplink;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

public class ${className} extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Intent intent = getIntent();
        Uri data = intent.getData();
        
        if (data != null) {
            String scheme = data.getScheme();
            String host = data.getHost();
            String path = data.getPath();
            ${entry.params ? `String ${entry.params.split('=')[0]} = data.getQueryParameter("${entry.params.split('=')[0]}");` : ''}
            
            // Handle the deep link
            // TODO: Implement your logic here
        }
        
        finish();
    }
}`;
}

// Update manifest preview
function updateManifestPreview(): void {
  const entries = collectEntries();
  const manifest = generateManifest(entries);
  
  const codeElement = document.querySelector('#manifestCode code');
  if (codeElement && typeof Prism !== 'undefined') {
    const highlighted = Prism.highlight(manifest, Prism.languages.xml, 'xml');
    codeElement.innerHTML = highlighted;
  }
}

// Generate and download .aix file
async function submitUserForm(): Promise<void> {
  const entries = collectEntries();
  
  if (entries.length === 0) {
    alert('Please add at least one deep link entry.');
    return;
  }

  try {
    const zip = new JSZip();
    
    // Add Android manifest
    const manifest = generateManifest(entries);
    zip.file('AndroidManifest.xml', manifest);
    
    // Add component files
    entries.forEach(entry => {
      const componentCode = generateComponent(entry);
      const className = `${entry.scheme}_${entry.host}_Activity`.replace(/[^a-zA-Z0-9_]/g, '_');
      zip.file(`src/com/aemo/deeplink/${className}.java`, componentCode);
    });
    
    // Add component descriptor
    const componentsDescriptor = JSON.stringify({
      name: 'DeepLink',
      package: 'com.aemo.deeplink',
      version: '1.0',
      entries: entries.map(e => ({
        scheme: e.scheme,
        host: e.host,
        path: e.path,
        params: e.params
      }))
    }, null, 2);
    zip.file('components.json', componentsDescriptor);
    
    // Generate .aix file
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'DeepLinkExtension.aix');
    
  } catch (error) {
    console.error('Error generating .aix:', error);
    alert('Error generating extension. Please check the console for details.');
  }
}

// Expose functions to global scope
(window as unknown as Record<string, unknown>).toggleDarkMode = toggleDarkMode;
(window as unknown as Record<string, unknown>).addFormEntry = addFormEntry;
(window as unknown as Record<string, unknown>).removeEntry = removeEntry;
(window as unknown as Record<string, unknown>).submitUserForm = submitUserForm;
