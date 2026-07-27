/* Дизайн-система ИС «АСУ» — theme-токены Ant Design и константы дизайн-системы.
   Единый источник правды для цветов, типографики и моушена. */

import type { ThemeConfig } from 'antd';

/* ============================================================
   Палитра дизайн-системы
   ============================================================ */
export const palette = {
  /** Графит — фон иконочной навигационной колонки */
  graphite: '#1B2A3D',
  /** Фон страницы */
  bgLayout: '#F7F8FA',
  /** Поверхность карточек */
  bgContainer: '#FFFFFF',
  /** Основной текст */
  text: '#1F2937',
  /** Вторичный текст */
  textSecondary: '#64748B',
  /** Единственный акцент интерфейса — тёмная бирюза */
  primary: '#0E7C86',
  /** Только для статусов/бейджей, не для кнопок */
  success: '#2F8F5B',
  warning: '#C98A1E',
  danger: '#C4453D',
  /** Бордеры карточек и разделители */
  border: '#E5E7EB',
} as const;

/* ============================================================
   Типографика
   ============================================================ */
export const fonts = {
  /** Основной шрифт интерфейса */
  sans: "'IBM Plex Sans', -apple-system, 'Segoe UI', system-ui, sans-serif",
  /** Только для номеров документов, ИИН/БИН, денежных сумм */
  mono: "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
} as const;

/* ============================================================
   Моушен — производственный тон: быстро, точно, ease-out
   ============================================================ */
export const motionTokens = {
  /** Микропереходы: hover, подсветка */
  fast: 0.12,
  /** Стандартные переходы: тосты, fade */
  base: 0.2,
  /** Крупные переходы: модалки, панели */
  slow: 0.22,
  /** ease-out — без bounce/elastic */
  ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
} as const;

/* Тень — исключительно для «плавающих» элементов (модалки, дропдауны, поповеры) */
export const floatingShadow = '0 8px 24px rgba(15, 23, 42, .12)';

/* ============================================================
   Theme-токены Ant Design 5 (ConfigProvider)
   ============================================================ */
export const antdTheme: ThemeConfig = {
  token: {
    /* Цвет */
    colorPrimary: palette.primary,
    colorSuccess: palette.success,
    colorWarning: palette.warning,
    colorError: palette.danger,
    colorInfo: palette.primary,

    colorBgLayout: palette.bgLayout,
    colorBgContainer: palette.bgContainer,
    colorBgElevated: palette.bgContainer,

    colorText: palette.text,
    colorTextSecondary: palette.textSecondary,
    colorTextTertiary: palette.textSecondary,

    colorBorder: palette.border,
    colorBorderSecondary: palette.border,
    colorSplit: palette.border,

    /* Типографика */
    fontFamily: fonts.sans,
    fontSize: 14,

    /* Геометрия — плоский, сдержанный стиль */
    borderRadius: 8,
    borderRadiusLG: 10,
    borderRadiusSM: 6,

    /* Плоские поверхности: без теней у статичного layout */
    boxShadow: 'none',
    boxShadowSecondary: floatingShadow,
    boxShadowTertiary: 'none',

    /* Моушен antd в мс — согласован с motionTokens */
    motionDurationFast: '0.12s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.22s',
    motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  components: {
    Layout: {
      siderBg: palette.graphite,
      headerBg: palette.bgContainer,
      bodyBg: palette.bgLayout,
      headerHeight: 56,
      headerPadding: '0 20px',
    },
    Menu: {
      darkItemBg: palette.graphite,
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.06)',
      darkItemSelectedColor: '#FFFFFF',
      darkItemColor: 'rgba(255, 255, 255, 0.65)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      collapsedIconSize: 18,
    },
    Card: {
      /* Только 1px бордер, без теней */
      boxShadowTertiary: 'none',
      colorBorderSecondary: palette.border,
    },
    Modal: {
      /* «Плавающий» элемент — единственное место с тенью */
      boxShadow: floatingShadow,
      titleFontSize: 16,
    },
    Dropdown: {
      boxShadowSecondary: floatingShadow,
    },
    Select: {
      controlHeight: 40,
      controlHeightSM: 34,
      optionSelectedBg: '#E6F4F5',
      optionActiveBg: '#F0F7F8',
      selectorBg: '#FFFFFF',
      activeBorderColor: palette.primary,
      hoverBorderColor: '#4A9CA3',
      activeOutlineColor: 'rgba(14, 124, 134, 0.16)',
    },
    Popover: {
      boxShadowSecondary: floatingShadow,
    },
    Table: {
      headerBg: '#FAFBFC',
      headerColor: palette.textSecondary,
      rowHoverBg: '#F1F5F9',
      borderColor: palette.border,
      headerSplitColor: 'transparent',
    },
    Button: {
      /* Плоские secondary-кнопки, тень только у primary */
      defaultShadow: 'none',
      primaryShadow: '0 2px 6px rgba(14, 124, 134, 0.24)',
      dangerShadow: 'none',
      fontWeight: 500,
    },
    Tooltip: {
      colorBgSpotlight: palette.graphite,
    },
    Badge: {
      colorError: palette.danger,
    },
    Tag: {
      defaultBg: '#F1F5F9',
    },
    Breadcrumb: {
      itemColor: palette.textSecondary,
      lastItemColor: palette.text,
      separatorColor: palette.textSecondary,
    },
    Notification: {
      boxShadow: floatingShadow,
    },
    Message: {
      boxShadow: floatingShadow,
    },
  },
};

export default antdTheme;
