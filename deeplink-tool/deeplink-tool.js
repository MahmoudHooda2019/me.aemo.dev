const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? '1' : '0');
};

function generateEntrySummary(group) {
  const fields = [
    { label: 'schema', name: 'schema' },
    { label: 'host', name: 'host' },
    { label: 'pathPrefix', name: 'pathPrefix' },
    { label: 'path', name: 'path' },
    { label: 'port', name: 'port' },
    { label: 'mimeType', name: 'mimeType' }
  ];
  const summary = fields.map(f => {
    const value = group.querySelector(`[name="${f.name}"]`).value.trim();
    return value ? `${f.label}: ${value}` : '';
  }).filter(Boolean).join(', ');
  return summary || '(empty)';
}

function addFormEntry() {
  const form = document.getElementById('form');
  // Auto-collapse all other entries
  const allCollapsibles = form.querySelectorAll('.form-collapsible');
  allCollapsibles.forEach(collapsible => {
    const group = collapsible.querySelector('.form-group');
    const header = collapsible.querySelector('.form-collapsible-header');
    if (group) group.style.display = 'none';
    if (header) header.querySelector('.toggle-arrow').innerHTML = '&#9654;';
  });

  // Create collapsible container
  const collapsible = document.createElement('div');
  collapsible.className = 'form-collapsible';

  // Header with toggle and summary
  const header = document.createElement('div');
  header.className = 'form-collapsible-header';
  header.innerHTML = `<span class="toggle-arrow">&#9660;</span> <span class="entry-summary">(empty)</span>`;
  header.style.cursor = 'pointer';

  // Form group (fields)
  const group = document.createElement('div');
  group.className = 'form-group';

  const fields = [
    { label: 'Schema', name: 'schema' },
    { label: 'Host', name: 'host' },
    { label: 'Path Prefix', name: 'pathPrefix' },
    { label: 'Path', name: 'path' },
    { label: 'Port', name: 'port' },
    { label: 'MIME Type', name: 'mimeType' }
  ];

  const hints = {
    schema: 'The URI scheme (e.g., http, https, file, content, etc.)',
    host: 'The host part of the URI (e.g., www.example.com)',
    pathPrefix: 'The prefix for the path (e.g., /foo)',
    path: 'The exact path (e.g., /foo/bar)',
    port: 'The port number (e.g., 8080)',
    mimeType: 'The MIME type (e.g., text/html)'
  };

  fields.forEach(({ label, name }) => {
    const fieldLabel = document.createElement('label');
    fieldLabel.textContent = label;
    // Add tooltip icon
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip-hint';
    tooltip.innerHTML = ' <span class="hint-icon">&#9432;</span>';
    const tooltipText = document.createElement('span');
    tooltipText.className = 'tooltip-text';
    tooltipText.textContent = hints[name] || '';
    tooltip.appendChild(tooltipText);
    fieldLabel.appendChild(tooltip);
    const fieldInput = document.createElement('input');
    fieldInput.type = 'text';
    fieldInput.name = name;
    fieldInput.placeholder = label;
    group.appendChild(fieldLabel);
    group.appendChild(fieldInput);

    // Update summary on input
    fieldInput.addEventListener('input', function () {
      // Host label logic for schema
      if (name === 'schema') {
        const hostLabel = group.querySelector('label:nth-of-type(2)');
        const value = fieldInput.value.trim();
        if (["http", "https", "ftp", "file", "content"].includes(value)) {
          hostLabel.textContent = 'Host';
        } else {
          hostLabel.textContent = 'Host';
        }
      }
      // Update summary
      header.querySelector('.entry-summary').textContent = generateEntrySummary(group);
      previewManifest();
    });
  });

  // Add header and group to collapsible
  collapsible.appendChild(header);
  collapsible.appendChild(group);

  // Collapsing logic
  header.addEventListener('click', function() {
    const isOpen = group.style.display !== 'none';
    group.style.display = isOpen ? 'none' : '';
    header.querySelector('.toggle-arrow').innerHTML = isOpen ? '&#9654;' : '&#9660;';
  });

  // Always expand the newly added entry
  group.style.display = '';
  header.querySelector('.toggle-arrow').innerHTML = '&#9660;';
  // Set initial summary
  header.querySelector('.entry-summary').textContent = generateEntrySummary(group);

  form.appendChild(collapsible);
  previewManifest();
}

async function submitUserForm() {
  const formGroups = document.querySelectorAll('.form-group');
  const dataTags = [];
  let hasAnyData = false;

  // Process each form group to create data tags
  formGroups.forEach(group => {
    const fields = {
      schema: group.querySelector('[name="schema"]').value.trim(),
      host: group.querySelector('[name="host"]').value.trim(),
      pathPrefix: group.querySelector('[name="pathPrefix"]').value.trim(),
      path: group.querySelector('[name="path"]').value.trim(),
      port: group.querySelector('[name="port"]').value.trim(),
      mimeType: group.querySelector('[name="mimeType"]').value.trim()
    };

    // Only add <data ... /> if at least one field is filled
    if (fields.schema || fields.host || fields.pathPrefix || fields.path || fields.port || fields.mimeType) {
      hasAnyData = true;
      let dataTag = '<data';
      const attributeMap = {
        schema: 'scheme',
        host: 'host',
        pathPrefix: 'pathPrefix',
        path: 'path',
        port: 'port',
        mimeType: 'mimeType'
      };
      Object.entries(fields).forEach(([field, value]) => {
        if (value) {
          dataTag += ` android:${attributeMap[field]}=\"${value}\"`;
        }
      });
      dataTag += ' />';
      dataTags.push(dataTag);
    }
  });

  // Build a single activity with one intent-filter and all data tags
  let activity = `<activity android:exported=\"true\" android:name=\"me.aemo.deeplink.DeepLinkActivity\">\n`;
  activity += `    <intent-filter android:autoVerify=\"true\">\n`;
  activity += `        <action android:name=\"android.intent.action.VIEW\" />\n`;
  activity += `        <category android:name=\"android.intent.category.DEFAULT\" />\n`;
  activity += `        <category android:name=\"android.intent.category.BROWSABLE\" />\n`;
  if (hasAnyData) {
    activity += dataTags.map(tag => '        ' + tag).join('\\n') + '\\n';
  }
  activity += `    </intent-filter>\n`;
  activity += `</activity>\n`;

  // Create component_build_infos.json content
  const buildInfo = {
    compiledBy: "FAST v3.8.0",
    author: "A E M O",
    activities: [activity],
    type: "me.aemo.deeplink.DeepLink",
    androidMinSdk: ["7"]
  };

  try {
    // Fetch the base .aix file
    const response = await fetch('me.aemo.deeplink.aix');
    if (!response.ok) throw new Error('Base .aix file not found');
    const baseAixBlob = await response.blob();
    const baseAixArrayBuffer = await baseAixBlob.arrayBuffer();

    // Load the .aix as a zip
    const zip = await JSZip.loadAsync(baseAixArrayBuffer);

    // Overwrite the JSON file
    zip.file('me.aemo.deeplink/files/component_build_infos.json', JSON.stringify([buildInfo]));

    // Generate and download the new .aix file
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'me.aemo.deeplink.aix');
  } catch (error) {
    console.error('Error editing .aix file:', error);
    alert('Error creating extension file. Please check the console for details.');
  }
}

function formatManifestActivity(activity) {
  // Remove extra spaces and format for pretty XML
  return activity
    .replace(/\s*=\s*"/g, '="')
    .replace(/\s*>/g, '>')
    .replace(/\n/g, '\n    ')
    .replace(/<activity /, '\n<activity ')
    .replace(/<intent-filter /, '\n    <intent-filter ')
    .replace(/<action /, '\n        <action ')
    .replace(/<category /g, '\n        <category ')
    .replace(/<data /, '\n        <data ')
    .replace(/<\/intent-filter>/, '\n    </intent-filter>')
    .replace(/<\/activity>/, '\n</activity>')
    .replace(/\n    \n/g, '\n');
}

function previewManifest() {
  const formGroups = document.querySelectorAll('.form-group');
  const dataTags = [];
  let hasAnyData = false;

  formGroups.forEach(group => {
    const fields = {
      schema: group.querySelector('[name="schema"]').value.trim(),
      host: group.querySelector('[name="host"]').value.trim(),
      pathPrefix: group.querySelector('[name="pathPrefix"]').value.trim(),
      path: group.querySelector('[name="path"]').value.trim(),
      port: group.querySelector('[name="port"]').value.trim(),
      mimeType: group.querySelector('[name="mimeType"]').value.trim()
    };

    // Only add <data ... /> if at least one field is filled
    if (fields.schema || fields.host || fields.pathPrefix || fields.path || fields.port || fields.mimeType) {
      hasAnyData = true;
      let dataTag = '<data';
      const attributeMap = {
        schema: 'scheme',
        host: 'host',
        pathPrefix: 'pathPrefix',
        path: 'path',
        port: 'port',
        mimeType: 'mimeType'
      };
      Object.entries(fields).forEach(([field, value]) => {
        if (value) {
          dataTag += ` android:${attributeMap[field]}=\"${value}\"`;
        }
      });
      dataTag += ' />';
      dataTags.push(dataTag);
    }
  });

  // Build the manifest preview as a single activity/intent-filter
  let prettyManifest =
    `<activity android:exported="true" android:name="me.aemo.deeplink.DeepLinkActivity">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
`;
  if (hasAnyData) {
    prettyManifest += '\n' + dataTags.map(tag => '        ' + tag).join('\n') + '\n';
  }
  prettyManifest += '    </intent-filter>\n</activity>';

  const codeBlock = document.querySelector('#manifestCode code');
  codeBlock.textContent = prettyManifest.trim();
  if (window.Prism) {
    Prism.highlightElement(codeBlock);
  }
  document.getElementById('manifestPreviewContainer').style.display = 'block';
}

// Initialize dark mode from localStorage
if (localStorage.getItem('darkMode') === '1') {
  document.body.classList.add('dark-mode');
}

// Add initial form entry when page loads
document.addEventListener('DOMContentLoaded', () => {
  addFormEntry();
  previewManifest();
});