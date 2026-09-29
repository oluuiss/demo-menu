import { useId } from 'react';

// Inline SVG flags: emoji flags do not render on Windows, so these keep the selector consistent everywhere.
export default function Flag({ country, size = 22 }) {
  const clip = `flag-${useId().replace(/:/g, '')}`;
  const height = Math.round((size * 2) / 3);
  return (
    <svg width={size} height={height} viewBox="0 0 30 20" aria-hidden="true" className="flag">
      <defs>
        <clipPath id={clip}>
          <rect width="30" height="20" rx="3.5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>{FLAGS[country]}</g>
      <rect width="30" height="20" rx="3.5" fill="none" stroke="rgb(255 255 255 / 0.25)" />
    </svg>
  );
}

const US_STRIPES = Array.from({ length: 13 }, (_, i) => (
  <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13 + 0.05} fill={i % 2 ? '#fff' : '#b22234'} />
));

const US_STARS = [];
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 5; col++) {
    US_STARS.push(<circle key={`${row}-${col}`} cx={1.4 + col * 2.4 + (row % 2) * 1.2} cy={1.4 + row * 2.4} r="0.55" fill="#fff" />);
  }
}

const FLAGS = {
  US: (
    <>
      {US_STRIPES}
      <rect width="13" height={(20 / 13) * 7} fill="#3c3b6e" />
      {US_STARS}
    </>
  ),
  DE: (
    <>
      <rect width="30" height="6.67" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#dd0000" />
      <rect y="13.33" width="30" height="6.67" fill="#ffce00" />
    </>
  ),
  BR: (
    <>
      <rect width="30" height="20" fill="#009c3b" />
      <path d="M15 2.4 L27.2 10 L15 17.6 L2.8 10 Z" fill="#ffdf00" />
      <circle cx="15" cy="10" r="4.6" fill="#002776" />
      <path d="M10.6 9.2 Q15 7.9 19.4 10.8" stroke="#fff" strokeWidth="0.9" fill="none" />
    </>
  ),
};
