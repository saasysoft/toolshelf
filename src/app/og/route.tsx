import { ImageResponse } from 'next/og';
import { getToolCount, getCategories } from '@/lib/queries';

export const runtime = 'edge';

export async function GET() {
  const [toolCount, categories] = await Promise.all([
    getToolCount(),
    getCategories(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#09090b',
          padding: '60px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              fontWeight: 700,
            }}
          >
            T
          </div>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#a1a1aa' }}>
            ToolShelf
          </span>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#fafafa',
              lineHeight: 1.1,
            }}
          >
            Curated Developer Tools
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#a1a1aa',
              lineHeight: 1.4,
            }}
          >
            Discover the best tools with AI-enriched quality scores,
            maintenance status, and compatibility data.
          </div>
        </div>

        {/* Footer stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Stat value={`${toolCount.toLocaleString()}+`} label="Tools" />
          <Stat value={`${categories.length}`} label="Categories" />
          <Stat value="AI" label="Quality Scores" />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '20px', color: '#52525b' }}>
            toolshelf.dev
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <span style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
        {value}
      </span>
      <span style={{ fontSize: '18px', color: '#71717a' }}>{label}</span>
    </div>
  );
}
