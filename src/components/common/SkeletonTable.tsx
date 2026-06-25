import { Grid } from 'antd';
import Skeleton from 'react-loading-skeleton';

const { useBreakpoint } = Grid;

interface Props {
  rows?: number;
  cols?: number;
}

export default function SkeletonTable({ rows = 6, cols = 4 }: Props) {
  const screens = useBreakpoint();

  if (screens.md === false) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: '8px 12px' }}>
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                  borderBottom: j < cols - 1 ? '1px solid #f5f5f5' : 'none',
                  minHeight: 28,
                  alignItems: 'center',
                }}
              >
                <Skeleton height={12} width={70} borderRadius={3} />
                <Skeleton height={12} width={90} borderRadius={3} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '2px solid #f0f0f0' }}>
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} style={{ flex: 1 }}>
            <Skeleton height={12} width="55%" borderRadius={3} />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 16, padding: '13px 0', borderBottom: '1px solid #f0f0f0' }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} style={{ flex: 1 }}>
              <Skeleton height={16} borderRadius={4} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
