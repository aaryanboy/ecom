// App/theme.js

export const lightTheme = {
  // Layout
  background: "bg-neutral-50",
  navbar: "bg-white",
  sidebar: "bg-neutral-100",
  card: "bg-white",
  modal: "bg-white",
  imageBg: "bg-neutral-50",
  overlay: "bg-black/30",

  // Buttons (no blue)
  button: "bg-emerald-600 text-white",
  buttonHover: "hover:bg-emerald-700 hover:text-white",
  buttonActive: "bg-emerald-800",
  buttonText: "text-white",

  // Text
  text: "text-neutral-900",
  textHover: "hover:text-neutral-700",
  secondaryText: "text-neutral-600",
  mutedText: "text-neutral-500",
  link: "text-emerald-600",

  // Borders & Dividers
  border: "border-neutral-200",
  divide: "divide-neutral-200",

  // States
  success: "text-emerald-600",
  danger: "text-rose-600",
  dangerHover: "hover:text-rose-700",

  // UI Elements
  chip: "bg-neutral-100",
  accentSoft: "bg-emerald-50",
  spinnerBorder: "border-emerald-500",

  // Alerts
  alertErrorBg: "bg-rose-100",
  alertErrorBorder: "border-rose-400",
  alertErrorText: "text-rose-700",

  // Focus
  focusRing: "focus:ring-emerald-500",
};

export const darkTheme = {
  // Layout (soft dark, NOT black)
  background: "bg-neutral-800",
  navbar: "bg-neutral-700",
  sidebar: "bg-neutral-700",
  card: "bg-neutral-600",
  modal: "bg-neutral-700",
  imageBg: "bg-neutral-600",
  overlay: "bg-black/40",

  // Buttons
  button: "bg-emerald-500 text-neutral-900",
  buttonHover: "hover:bg-emerald-400",
  buttonActive: "bg-emerald-600",
  buttonText: "text-neutral-900",

  // Text (high visibility)
  text: "text-neutral-100",
  textHover: "hover:text-white",
  secondaryText: "text-neutral-200",
  mutedText: "text-neutral-300",
  link: "text-emerald-400",

  // Borders & Dividers
  border: "border-neutral-500",
  divide: "divide-neutral-500",

  // States
  success: "text-emerald-400",
  danger: "text-rose-400",
  dangerHover: "hover:text-rose-300",

  // UI Elements
  chip: "bg-neutral-500",
  accentSoft: "bg-emerald-400/20",
  spinnerBorder: "border-emerald-300",

  // Alerts
  alertErrorBg: "bg-rose-500/20",
  alertErrorBorder: "border-rose-400",
  alertErrorText: "text-rose-200",

  // Focus
  focusRing: "focus:ring-emerald-400",
};
