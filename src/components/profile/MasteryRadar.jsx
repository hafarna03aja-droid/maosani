import { motion } from 'framer-motion';

/**
 * MasteryRadar — Custom SVG Radar Chart
 * @param {Array} data - [{ subject: 'Hijaiyah', value: 80, fullMark: 100 }, ...]
 */
export default function MasteryRadar({ data, size = 300 }) {
  if (!data || data.length === 0) return null;

  const padding = 50;
  const radius = (size - padding * 2) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const angles = (Math.PI * 2) / data.length;

  const getCoordinates = (index, value) => {
    const angle = index * angles - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  // Generate grid lines (pentagon/hexagon etc)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  const gridPaths = gridLevels.map(level => {
    return data.map((_, i) => {
      const { x, y } = getCoordinates(i, level * 100);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  });

  // Generate main data path
  const dataPath = data.map((d, i) => {
    const { x, y } = getCoordinates(i, d.value);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ' Z';

  return (
    <div className="mastery-radar-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid Lines */}
        {gridPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Path */}
        <motion.path
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          d={dataPath}
          fill="rgba(59, 130, 246, 0.25)"
          stroke="var(--blue-400)"
          strokeWidth="2"
        />

        {/* Labels */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, 120); // Push labels out
          const textAnchor = x < centerX ? 'end' : x > centerX ? 'start' : 'middle';
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="rgba(255,255,255,0.6)"
              fontSize="12"
              textAnchor={textAnchor}
              dominantBaseline="middle"
            >
              {d.subject}
            </text>
          );
        })}
      </svg>

      <style jsx>{`
        .mastery-radar-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
        }
        text {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
