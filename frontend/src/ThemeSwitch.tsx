export default function ThemeSwitch() {
  return (
    <label htmlFor="theme-toggle" className="tp" title="Switch dark / light">
      <span className="tp-track">
        <span className="tp-knob">
          {/* moon icon (dark mode) */}
          <svg className="tp-moon" viewBox="0 0 24 24">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>

          {/* sun icon (light mode) */}
          <svg className="tp-sun" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </span>
      </span>

      {/* "Dark" / "Light" text CSS se aata hai */}
      <span className="tp-text" />
    </label>
  );
}