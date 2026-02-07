import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
  token: {
    // Colors
    colorPrimary: '#7c3aed', // Purple-600
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    
    // Typography
    fontFamily: "'Noto Sans Lao', sans-serif",
    fontSize: 14,
    
    // Border
    borderRadius: 8,
    
    // Layout
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f3f4f6',
  },
  components: {
    Button: {
      controlHeight: 36,
      borderRadius: 6,
    },
    Input: {
      controlHeight: 36,
      borderRadius: 6,
    },
    Select: {
      controlHeight: 36,
      borderRadius: 6,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Table: {
      borderRadius: 8,
    },
  },
}
