// DeepLink Extension Generator Tool
// @ts-check

import JSZip from 'jszip';

interface DeepLinkEntry {
  scheme: string;
  host: string;
  path: string;
  params: string;
}

const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]{0,63}$/;
const HOST_PATTERN = /^(?=.{1,253}$)[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/;
const PATH_PATTERN = /^\/[a-zA-Z0-9._~!$&'()*+,;=:@%/*-]*$/;
const PARAM_NAME_PATTERN = /^[a-zA-Z0-9_.~-]+$/;
const JAVA_RESERVED_WORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
  'package', 'private', 'protected', 'public', 'return', 'short', 'static',
  'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'try', 'void', 'volatile', 'while'
]);

let entryCount = 0;

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
  const id = entryCount;
  const form = document.getElementById('form');
  if (!form) return;

  const entryDiv = document.createElement('div');
  entryDiv.className = 'form-entry';
  entryDiv.dataset.entryId = id.toString();

  entryDiv.append(
    createInputRow('Scheme', 'scheme-input', 'e.g., myapp', 'scheme'),
    createInputRow('Host', 'host-input', 'e.g., open', 'host'),
    createInputRow('Path', 'path-input', 'e.g., /page', 'path'),
    createInputRow('Params', 'params-input', 'e.g., id=123', 'params')
  );

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'remove-btn';
  removeButton.setAttribute('aria-label', 'Remove entry');
  removeButton.textContent = '×';
  removeButton.addEventListener('click', () => removeEntry(id));
  entryDiv.appendChild(removeButton);

  form.appendChild(entryDiv);
  
  // Add input listeners for preview
  const inputs = entryDiv.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', updateManifestPreview);
  });
}

function createInputRow(label: string, className: string, placeholder: string, field: string): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'input-row';

  const labelElement = document.createElement('label');
  labelElement.textContent = `${label}:`;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = className;
  input.placeholder = placeholder;
  input.dataset.field = field;

  row.append(labelElement, input);
  return row;
}

// Remove a form entry
function removeEntry(id: number): void {
  const entry = document.querySelector(`[data-entry-id="${id}"]`);
  if (entry) {
    entry.remove();
    updateManifestPreview();
  }
}

// Collect all form entries
function collectEntries(): DeepLinkEntry[] {
  const formEntries = document.querySelectorAll('.form-entry');
  const result: DeepLinkEntry[] = [];

  formEntries.forEach(entry => {
    const scheme = ((entry.querySelector('.scheme-input') as HTMLInputElement)?.value || '').trim();
    const host = ((entry.querySelector('.host-input') as HTMLInputElement)?.value || '').trim();
    const path = ((entry.querySelector('.path-input') as HTMLInputElement)?.value || '').trim();
    const params = ((entry.querySelector('.params-input') as HTMLInputElement)?.value || '').trim();

    if (scheme && host) {
      result.push({ scheme, host, path, params });
    }
  });

  return result;
}

function validateEntries(entries: DeepLinkEntry[]): string[] {
  const errors: string[] = [];

  entries.forEach((entry, index) => {
    const label = `Entry ${index + 1}`;

    if (!SCHEME_PATTERN.test(entry.scheme)) {
      errors.push(`${label}: scheme must start with a letter and contain only letters, numbers, dots, hyphens, and plus signs.`);
    }

    if (!HOST_PATTERN.test(entry.host)) {
      errors.push(`${label}: host must contain only letters, numbers, dots, and hyphens.`);
    }

    if (entry.path && !PATH_PATTERN.test(entry.path)) {
      errors.push(`${label}: path must start with / and contain only URL path characters.`);
    }

    getParamNames(entry.params).forEach(paramName => {
      if (!PARAM_NAME_PATTERN.test(paramName)) {
        errors.push(`${label}: query parameter "${paramName}" contains unsupported characters.`);
      }
    });
  });

  return errors;
}

function getParamNames(params: string): string[] {
  if (!params) return [];

  return params
    .split('&')
    .map(part => part.split('=')[0]?.trim() || '')
    .filter(Boolean);
}

function createActivityClassName(entry: DeepLinkEntry): string {
  const rawName = `${entry.scheme}_${entry.host}_Activity`;
  const safeName = rawName.replace(/[^a-zA-Z0-9_$]/g, '_');
  return toJavaIdentifier(safeName || 'DeepLinkActivity');
}

function toJavaIdentifier(value: string): string {
  const safe = value.replace(/[^a-zA-Z0-9_$]/g, '_') || '_';
  const identifier = /^[a-zA-Z_$]/.test(safe) ? safe : `_${safe}`;
  return JAVA_RESERVED_WORDS.has(identifier) ? `_${identifier}` : identifier;
}

function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeJavaString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

function generateQueryParamLines(entry: DeepLinkEntry): string {
  const usedNames = new Set<string>();

  return getParamNames(entry.params)
    .map(paramName => {
      const baseName = toJavaIdentifier(paramName);
      let variableName = baseName;
      let suffix = 2;

      while (usedNames.has(variableName)) {
        variableName = `${baseName}_${suffix}`;
        suffix++;
      }

      usedNames.add(variableName);
      return `            String ${variableName} = data.getQueryParameter("${escapeJavaString(paramName)}");`;
    })
    .join('\n');
}

// Generate Android manifest XML
function generateManifest(entries: DeepLinkEntry[]): string {
  let activities = '';
  
  entries.forEach(entry => {
    const className = createActivityClassName(entry);
    const scheme = escapeXmlAttribute(entry.scheme);
    const host = escapeXmlAttribute(entry.host);
    const path = escapeXmlAttribute(entry.path || '.*');
    const port = '.*';
    
    activities += `    <activity android:name=".${className}">
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
  const className = createActivityClassName(entry);
  const queryParamLines = generateQueryParamLines(entry);
  
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
${queryParamLines}
            
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
  if (codeElement) {
    codeElement.textContent = manifest;
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Generate and download .aix file
async function submitUserForm(): Promise<void> {
  const entries = collectEntries();
  
  if (entries.length === 0) {
    alert('Please add at least one deep link entry.');
    return;
  }

  const validationErrors = validateEntries(entries);
  if (validationErrors.length > 0) {
    alert(validationErrors.join('\n'));
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
      const className = createActivityClassName(entry);
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
    downloadBlob(blob, 'DeepLinkExtension.aix');
    
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
