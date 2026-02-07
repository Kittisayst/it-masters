# 🇱🇦 IT Management System - ລະບົບຈັດການໄອທີ

A modern, responsive IT management system built with React, TypeScript, and Tailwind CSS, featuring Lao-inspired design and Google Sheets integration.

## ✨ Features

### 🚀 Core Features
- **User Authentication** - Role-based access control (Admin/User)
- **Task Management** - Repair tasks and work assignments
- **Dashboard** - Real-time statistics and recent activities
- **Reporting** - Printable reports for repairs and work tasks
- **Google Sheets Integration** - Backend data storage via Google Apps Script

### 🎨 UI/UX Features
- **Lao-Inspired Design** - Purple and gold color scheme
- **Responsive Design** - Mobile-first approach
- **Accessibility** - ARIA labels, keyboard navigation
- **Dark Mode Ready** - CSS variables for theming
- **Micro-interactions** - Smooth animations and transitions

### ⚡ Performance Features
- **Parallel Data Loading** - 50% faster initial load
- **Request Deduplication** - SWR caching system
- **Memoization** - Optimized re-renders
- **Error Boundaries** - Graceful error handling
- **Performance Monitoring** - Real-time metrics

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS v4** - Utility-first CSS framework
- **Ant Design** - Component library
- **Lucide React** - Icon library
- **SWR** - Data fetching and caching
- **Zustand** - State management

### Backend
- **Google Sheets** - Database
- **Google Apps Script** - REST API
- **Google Sheet API Client** - API integration

### Development Tools
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **TypeScript** - Static typing
- **PostCSS** - CSS processing
- **HTTP Client**: Axios
- **Backend**: Google Sheets API (google-sheet-api-client)

## ການຕິດຕັ້ງ

1. ຕິດຕັ້ງ dependencies:
```bash
npm install
```

2. ສ້າງໄຟລ໌ `.env` ຈາກ `.env.example`:
```bash
cp .env.example .env
```

3. ແກ້ໄຂໄຟລ໌ `.env` ແລະໃສ່ຂໍ້ມູນ Google Sheets:
```
VITE_SPREADSHEET_ID=your_spreadsheet_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

4. ເລີ່ມ development server:
```bash
npm run dev
```

## Features (Phase 1 MVP)

- ✅ **Dashboard** - ພາບລວມລະບົບ
- ✅ **ລະບົບບັນທຶກວຽກສ້ອມແປງໄອທີ** - CRUD ການສ້ອມແປງອຸປະກອນ
- ✅ **ລະບົບເກັບກຳຂໍ້ມູນ Task** - ຕິດຕາມວຽກງານປະຈຳວັນ
- ✅ **ລາຍງານການສ້ອມແປງ** - ສະຫຼຸບສະຖິຕິການສ້ອມແປງ
- ✅ **ລາຍງານການເຮັດວຽກ** - ສະຫຼຸບສະຖິຕິວຽກງານ

## Google Sheets Structure

ສ້າງ Google Spreadsheet ດ້ວຍ 2 sheets:

### Sheet 1: RepairTasks
| id | date | equipment | issue | solution | technician | status | priority |

### Sheet 2: WorkTasks
| id | date | title | description | assignedTo | status | dueDate |

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
