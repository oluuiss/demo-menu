import './CategoryTabs.css';

/** Horizontally scrollable pill tabs. `options` is a list of { value, label }. */
export default function CategoryTabs({ options, active, onChange, label }) {
  return (
    <div className="category-tabs" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={active === option.value}
          className={`category-tabs__tab ${active === option.value ? 'is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
