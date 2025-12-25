// App/theme.js

export const lightTheme = {

  theme: "light",
  // Layout
  background: "bg-gray-50",
  surface: "bg-white",
  navbar: "bg-white",
  sidebar: "bg-white",
  card: "bg-white",
  modal: "bg-white",
  imageBg: "bg-gray-100",
  overlay: "bg-black/40",
  bar: "via-black",

  // Text
  text: "text-slate-900",
  textHover: "hover:text-amber-600",
  secondaryText: "text-slate-600",
  mutedText: "text-slate-500",
  onPrimary: "text-white",

  // Brand
  primary: "bg-amber-600", // Daraz/Amazon style energetic primary
  primaryHover: "hover:bg-amber-700",
  link: "text-blue-600 hover:text-blue-700",

  // Buttons
  button: "bg-amber-600 text-white shadow-sm active:bg-amber-700",
  buttonHover: "hover:bg-amber-700 hover:shadow-md transition-all",
  buttonSecondary: "bg-white text-slate-700 border border-slate-200 hover:bg-gray-50",
  buttonGhost: "text-slate-600 hover:bg-gray-100",

  // Borders
  border: "border-slate-200",
  divide: "divide-slate-200",
  inputBorder: "border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500",

  // States
  success: "text-emerald-700 bg-emerald-50",
  danger: "text-rose-700 bg-rose-50",
  warning: "text-amber-700 bg-amber-50",

  // Effects via-slate-300
  shadow: "shadow-sm",
  shadowHover: "hover:shadow-lg",
  ring: "ring-slate-200",
};

export const darkTheme = {

  theme: "dark",
  // Layout
  background: "bg-slate-950",
  surface: "bg-slate-900",
  navbar: "bg-slate-900",
  sidebar: "bg-slate-900",
  card: "bg-slate-900",
  modal: "bg-slate-900",
  imageBg: "bg-slate-800",
  overlay: "bg-black/60",
  bar: "via-slate-600",

  // Text
  text: "text-slate-100",
  textHover: "hover:text-amber-400",
  secondaryText: "text-slate-400",
  mutedText: "text-slate-500",
  onPrimary: "text-slate-900",

  // Brand
  primary: "bg-amber-500",
  primaryHover: "hover:bg-amber-400",
  link: "text-blue-400 hover:text-blue-300",

  // Buttons
  button: "bg-amber-500 text-slate-900 shadow-sm active:bg-amber-600",
  buttonHover: "hover:bg-amber-400 hover:shadow-md transition-all",
  buttonSecondary: "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700",
  buttonGhost: "text-slate-400 hover:bg-slate-800",

  // Borders
  border: "border-slate-800",
  divide: "divide-slate-800",
  inputBorder: "border-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500",

  // States
  success: "text-emerald-400 bg-emerald-950/30",
  danger: "text-rose-400 bg-rose-950/30",
  warning: "text-amber-400 bg-amber-950/30",

  // Effects
  shadow: "shadow-none",
  shadowHover: "hover:bg-slate-800",
  ring: "ring-slate-800",
};
