# 🚀 Aemo Developer

> **Professional MIT App Inventor Extensions & Developer Tools**

Welcome to Aemo Developer - your one-stop destination for high-quality MIT App Inventor extensions and developer tools.

[![Website](https://img.shields.io/website?url=https%3A%2F%2Faemo.pages.dev)](https://aemo.pages.dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [License](#license)

## 🎯 About

Aemo Developer provides a curated collection of MIT App Inventor extensions and developer tools designed to enhance your mobile app development experience.

## ✨ Features

- **Extensions Library**: Pre-built components to add powerful features to your App Inventor projects
- **Developer Tools**: Utilities like Base64 encoder/decoder and deep link generator
- **Easy Integration**: Simple import process for all extensions
- **Regular Updates**: New extensions and features added regularly

## 🚀 Quick Start

1. Visit our website: [aemo.pages.dev](https://aemo.pages.dev)
2. Browse our extension library
3. Download the extensions you need
4. Import them into your MIT App Inventor projects
5. Start building amazing apps

## 📚 API Documentation

Our API provides programmatic access to our extension library.

### Endpoints

- `GET /api/extensions` - List all available extensions
  - Supports optional `?filter=<filter_name>` query parameter
  - Supports optional `?data=id,title,price` query parameter to select specific fields
- `GET /api/extensions/{id}` - Get details for a specific extension

### Usage

No authentication required for public endpoints. Rate limits apply.

## 📄 License

MIT License

Copyright (c) 2023 Aemo Developer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
