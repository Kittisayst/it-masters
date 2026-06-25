import Skeleton from 'react-loading-skeleton';

export default function SkeletonStatCard() {
  return (
    <div style={{ padding: '4px 0' }}>
      <Skeleton height={13} width={90} borderRadius={4} style={{ marginBottom: 10 }} />
      <Skeleton height={30} width={72} borderRadius={4} />
    </div>
  );
}
