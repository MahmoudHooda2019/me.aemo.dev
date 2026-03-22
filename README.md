# 🚀 Aemo Developer

> **MIT App Inventor Extensions & Developer Tools - Vue 3 + TypeScript**

Welcome to Aemo Developer - your one-stop destination for high-quality MIT App Inventor extensions and developer tools. Now built with modern Vue 3 + TypeScript for better performance and developer experience.

[![Website](https://img.shields.io/website?url=https%3A%2F%2Faemo.pages.dev)](https://aemo.pages.dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.4+-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Development](#development)
- [API Documentation](#api-documentation)
- [License](#license)

## 🎯 About

Aemo Developer provides a curated collection of MIT App Inventor extensions and developer tools designed to enhance your mobile app development experience. This modern implementation uses Vue 3 + TypeScript for better maintainability and performance.

## ✨ Features

- **Extensions Library**: Pre-built components to add powerful features to your App Inventor projects
- **Developer Tools**: Utilities like Base64 encoder/decoder and deep link generator
- **Easy Integration**: Simple import process for all extensions
- **Regular Updates**: New extensions and features added regularly
- **Modern Architecture**: Built with Vue 3 + TypeScript for better performance
- **Responsive Design**: Mobile-first responsive layout
- **PWA Ready**: Install as a desktop/mobile app

## 🛠 Technology Stack

- **Frontend**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Scoped CSS with modern features
- **Animations**: AOS (Animate On Scroll)
- **Icons**: Custom SVG and image assets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd me.aemo.dev
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Or simply run:
   ```bash
   run.bat
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── components/           # Vue components
├── composables/          # Reusable composition functions
├── types/               # TypeScript type definitions
├── styles/              # Global styles
├── App.vue             # Root component
└── main.ts            # Application entry point
```

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
