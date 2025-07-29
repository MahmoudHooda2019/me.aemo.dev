# 🚀 Aemo Developer

> **Professional MIT App Inventor Extensions & Developer Tools**

Welcome to Aemo Developer - your one-stop destination for high-quality MIT App Inventor extensions, tools, and utilities that enhance your mobile app development experience.

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fme.aemo.dev)](https://me.aemo.dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Tools](#tools)
- [Development](#development)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## 🎯 About

Aemo Developer provides a curated collection of MIT App Inventor extensions and developer tools designed to:

- **Enhance Functionality**: Add powerful features to your App Inventor projects
- **Save Time**: Pre-built components for common use cases
- **Improve Quality**: Well-tested, documented extensions
- **Support Learning**: Comprehensive documentation and examples

## ✨ Features

### 🔧 Extensions Library
- **Categorized Extensions**: Organized by functionality (UI, Connectivity, Utilities, etc.)
- **Search & Filter**: Find extensions quickly with smart filtering
- **Version Management**: Track updates and compatibility
- **Documentation**: Comprehensive guides for each extension

### 🛠️ Developer Tools
- **Base64 Encoder/Decoder**: Convert text and files to/from Base64
- **Deep Link Generator**: Create and test deep links for your apps
- **Extension Template**: Boilerplate for creating new extensions

### 🌐 Web Platform
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Progressive Web App**: Install as an app on your device
- **Dark Theme**: Easy on the eyes for long coding sessions
- **Accessibility**: Screen reader friendly and keyboard navigable

## 🚀 Quick Start

### For App Inventor Users

1. **Browse Extensions**: Visit [me.aemo.dev](https://me.aemo.dev)
2. **Find Your Extension**: Use filters or search to find what you need
3. **Download**: Click the download button for the `.aix` file
4. **Import**: In App Inventor, go to Extensions → Import extension
5. **Use**: Drag the extension from the palette to your project

### For Developers

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/me.aemo.dev.git
   cd me.aemo.dev
   ```

2. **Install dependencies** (if any):
   ```bash
   npm install  # or yarn install
   ```

3. **Start development server**:
   ```bash
   npm start    # or python -m http.server 8000
   ```

4. **Open in browser**: Navigate to `http://localhost:8000`

## 📡 API Documentation

Our REST API provides programmatic access to extension data.

### Base URL
```
https://me.aemo.dev/api/
```

### Endpoints

#### Get All Extensions
```http
GET /api/extensions
```

**Query Parameters:**
- `filter` (optional): Filter by category (`ui`, `connectivity`, `utility`, etc.)
- `data` (optional): Comma-separated list of fields to return

**Example:**
```bash
curl "https://me.aemo.dev/api/extensions?filter=ui&data=id,title,price"
```

#### Get Specific Extension
```http
GET /api/extensions/{id}
```

**Example:**
```bash
curl "https://me.aemo.dev/api/extensions/my-extension-id"
```

### Response Format

```json
{
  "id": "extension-id",
  "title": "Extension Name",
  "subtitle": "Short description",
  "description": "Detailed description",
  "price": "Free",
  "filters": ["ui", "utility"],
  "tags": ["button", "animation"],
  "version": "1.0.0",
  "lastUpdated": "2024-01-15",
  "url": "https://example.com/download",
  "documentation": [
    {
      "title": "Getting Started",
      "content": "How to use this extension..."
    }
  ]
}
```

### Integration Examples

#### Android Studio (Java)

1. **Add Gson dependency**:
   ```gradle
   dependencies {
       implementation 'com.google.code.gson:gson:2.10.1'
   }
   ```

2. **Create model class**:
   ```java
   public class Extension {
       public String id;
       public String title;
       public String subtitle;
       public String description;
       public String price;
       public String[] filters;
       public String[] tags;
       public String version;
       public String lastUpdated;
       public String url;
       public DocumentationSection[] documentation;

       public static class DocumentationSection {
           public String title;
           public String content;
       }
   }
   ```

3. **Fetch data using Retrofit** (recommended):
   ```java
   public interface ApiService {
       @GET("api/extensions")
       Call<List<Extension>> getExtensions(@Query("filter") String filter);
   }
   ```

#### JavaScript/Web

```javascript
// Using fetch API
async function getExtensions(filter = 'all') {
    try {
        const response = await fetch(`/api/extensions?filter=${filter}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching extensions:', error);
        return [];
    }
}

// Usage
getExtensions('ui').then(extensions => {
    console.log('UI Extensions:', extensions);
});
```

#### Python

```python
import requests
import json

def get_extensions(filter_type='all'):
    """Fetch extensions from the API"""
    url = f"https://me.aemo.dev/api/extensions"
    params = {'filter': filter_type} if filter_type != 'all' else {}
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching extensions: {e}")
        return []

# Usage
ui_extensions = get_extensions('ui')
print(f"Found {len(ui_extensions)} UI extensions")
```

## 🛠️ Tools

### Base64 Encoder/Decoder
- **URL**: `/tools/base64/`
- **Features**: Text and file encoding/decoding, drag & drop support
- **Use Case**: Encode images or data for App Inventor projects

### Deep Link Generator
- **URL**: `/tools/deeplink/`
- **Features**: Generate and test deep links, QR code generation
- **Use Case**: Create links that open your published apps

## 💻 Development

### Project Structure

```
me.aemo.dev/
├── index.html              # Main landing page
├── manifest.json           # PWA manifest
├── _worker.js             # Cloudflare Worker for API
├── _headers               # HTTP headers configuration
├── assets/                # Images and static assets
├── extensions/            # Extension data and templates
│   ├── extensions.json    # Extension database
│   └── template.html      # Extension template
├── scripts/               # JavaScript modules
│   ├── script.js          # Main application logic
│   ├── extensions.js      # Extension API module
│   ├── error-handler.js   # Error handling system
│   ├── base64-tool.js     # Base64 tool logic
│   └── deeplink-tool.js   # Deep link tool logic
├── styles/                # CSS stylesheets
│   ├── styles.css         # Main styles
│   ├── error-handler.css  # Error notification styles
│   ├── base64-tool.css    # Base64 tool styles
│   └── deeplink-tool.css  # Deep link tool styles
└── tools/                 # Individual tool pages
    ├── base64/
    └── deeplink/
```

### Technologies Used

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Cloudflare Workers
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Performance**: Resource hints, lazy loading, optimized assets

### Adding New Extensions

1. **Update extensions.json**:
   ```json
   {
     "id": "your-extension-id",
     "title": "Your Extension Name",
     "subtitle": "Brief description",
     "description": "Detailed description with features",
     "price": "Free",
     "filters": ["category1", "category2"],
     "tags": ["tag1", "tag2"],
     "version": "1.0.0",
     "lastUpdated": "2024-01-15",
     "url": "https://example.com/download.aix",
     "documentation": [
       {
         "title": "Installation",
         "content": "How to install and use..."
       }
     ]
   }
   ```

2. **Test locally** before deploying
3. **Submit a pull request** with your changes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 **Report bugs** via GitHub Issues
- 💡 **Suggest features** or improvements
- 📝 **Improve documentation**
- 🔧 **Submit extensions** for review
- 🎨 **Enhance UI/UX**

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Documentation**: [me.aemo.dev](https://me.aemo.dev)
- **Issues**: [GitHub Issues](https://github.com/yourusername/me.aemo.dev/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/me.aemo.dev/discussions)
- **Email**: support@aemo.dev

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p><strong>Made with ❤️ for the MIT App Inventor community</strong></p>
  <p>
    <a href="https://me.aemo.dev">Website</a> •
    <a href="#api-documentation">API</a> •
    <a href="#tools">Tools</a> •
    <a href="#contributing">Contribute</a>
  </p>
</div>
