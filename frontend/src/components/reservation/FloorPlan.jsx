import { useI18n } from '../../i18n/I18nContext.jsx';
import './FloorPlan.css';

// Table coordinates come from the backend in a 600 x 420 landscape plan. On narrow screens
// the plan is transposed (x <-> y) into a portrait 420 x 600 layout instead of being shrunk.
const W = 600;
const H = 420;

function chairPositions(table) {
  const { x, y, width: w, height: h, seats, shape } = table;
  const gap = 10;
  if (seats === 1) return [];
  if (shape === 'ROUND') {
    const r = w / 2 + gap;
    return Array.from({ length: seats }, (_, i) => {
      const angle = (Math.PI * 2 * i) / seats + (seats === 2 ? 0 : Math.PI / 4);
      return [x + r * Math.cos(angle), y + r * Math.sin(angle)];
    });
  }
  const left = [x - w / 2 - gap, y];
  const right = [x + w / 2 + gap, y];
  const top = [x, y - h / 2 - gap];
  const bottom = [x, y + h / 2 + gap];
  if (seats === 2) return [left, right];
  if (seats === 4) return [left, right, top, bottom];
  // 6 seats: two on each long side, one on each end
  if (h > w) {
    return [
      [x - w / 2 - gap, y - h / 4], [x - w / 2 - gap, y + h / 4],
      [x + w / 2 + gap, y - h / 4], [x + w / 2 + gap, y + h / 4],
      top, bottom,
    ];
  }
  return [
    [x - w / 4, y - h / 2 - gap], [x + w / 4, y - h / 2 - gap],
    [x - w / 4, y + h / 2 + gap], [x + w / 4, y + h / 2 + gap],
    left, right,
  ];
}

export default function FloorPlan({ tables, selectedId, onSelect, portrait = false }) {
  const { t } = useI18n();
  const P = (x, y) => (portrait ? [y, x] : [x, y]);
  const S = (w, h) => (portrait ? [h, w] : [w, h]);

  const rect = (x, y, w, h, props) => {
    const [px, py] = P(x, y);
    const [pw, ph] = S(w, h);
    // x/y here are top-left corners in landscape space
    return <rect x={px} y={py} width={pw} height={ph} {...props} />;
  };
  const label = (x, y, text, className = 'floor__label') => {
    const [px, py] = P(x, y);
    return (
      <text x={px} y={py} className={className} textAnchor="middle" dominantBaseline="middle">
        {text}
      </text>
    );
  };

  const [vw, vh] = S(W, H);

  return (
    <svg className="floor" viewBox={`0 0 ${vw} ${vh}`} role="group" aria-label={t('reserve.floorPlan')}>
      <defs>
        <pattern id="floor-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgb(255 255 255 / 0.08)" strokeWidth="3" />
        </pattern>
        <linearGradient id="floor-selected" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9459" />
          <stop offset="1" stopColor="#dc5319" />
        </linearGradient>
      </defs>

      {/* Room */}
      {rect(8, 8, W - 16, H - 16, { rx: 22, className: 'floor__room' })}
      {/* Bar counter */}
      {rect(30, 32, 252, 32, { rx: 12, className: 'floor__bar' })}
      {label(156, 48, t('reserve.areas.bar'))}
      {/* Kitchen */}
      {rect(440, 20, 140, 90, { rx: 14, className: 'floor__kitchen' })}
      {label(510, 65, t('reserve.areas.kitchen'))}
      {/* Windows along the left wall */}
      {rect(10, 150, 5, 200, { rx: 2.5, className: 'floor__window' })}
      {!portrait && label(58, 140, t('reserve.areas.window'), 'floor__label floor__label--small')}
      {/* Lounge */}
      {rect(478, 126, 106, 256, { rx: 18, className: 'floor__lounge' })}
      {label(531, 394, t('reserve.areas.lounge'), 'floor__label floor__label--small')}
      {/* Entrance */}
      {rect(30, 406, 90, 6, { rx: 3, className: 'floor__entrance' })}
      {label(75, 392, t('reserve.areas.entrance'), 'floor__label floor__label--small')}

      {tables.map((table) => {
        const state = table.id === selectedId ? 'SELECTED' : table.state;
        const interactive = table.state === 'AVAILABLE';
        const [cx, cy] = P(table.x, table.y);
        const [w, h] = S(table.width, table.height);
        const select = () => interactive && onSelect(table);
        return (
          <g
            key={table.id}
            className={`floor__table is-${state.toLowerCase()}`}
            role="button"
            tabIndex={interactive ? 0 : -1}
            aria-pressed={state === 'SELECTED'}
            aria-disabled={!interactive}
            aria-label={t('reserve.tableAria', {
              code: table.code,
              seats: t('common.seats', { count: table.seats }),
              state: t(`reserve.legend.${state}`),
            })}
            onClick={select}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select();
              }
            }}
          >
            {chairPositions(table).map(([x, y], i) => {
              const [px, py] = P(x, y);
              return <circle key={i} cx={px} cy={py} r="6.5" className="floor__chair" />;
            })}
            {table.shape === 'ROUND' ? (
              <circle cx={cx} cy={cy} r={w / 2} className="floor__top" />
            ) : (
              <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx="9" className="floor__top" />
            )}
            <text x={cx} y={cy} className="floor__code" textAnchor="middle" dominantBaseline="central">
              {table.code}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
