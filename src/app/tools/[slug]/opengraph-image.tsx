import { ImageResponse } from 'next/og';
import { getToolBySlug } from '@/lib/queries';
import { formatNumber } from '@/lib/utils';

export const runtime = 'edge';
export const alt = 'Tool details';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            color: '#fafafa',
            fontSize: '48px',
            fontWeight: 700,
          }}
        >
          Tool Not Found — ToolShelf
        </div>
      ),
      { ...size },
    );
  }

  const maintenanceColors: Record<string, string> = {
    active: '#10b981',
    slowing: '#f59e0b',
    stale: '#f97316',
    abandoned: '#ef4444',
    unknown: '#71717a',
  };

  const scoreColor = tool.quality_score >= 80 ? '#10b981'
    : tool.quality_score >= 60 ? '#3b82f6'
    : tool.quality_score >= 40 ? '#f59e0b'
    : '#71717a';

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                color: 'white',
                fontWeight: 700,
              }}
            >
              T
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#71717a' }}>
              ToolShelf
            </span>
          </div>
          <span
            style={{
              fontSize: '16px',
              color: '#52525b',
              textTransform: 'capitalize',
              border: '1px solid #27272a',
              borderRadius: '9999px',
              padding: '6px 16px',
            }}
          >
            {tool.category.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#fafafa',
              lineHeight: 1.1,
            }}
          >
            {tool.name}
          </div>
          {tool.tagline && (
            <div
              style={{
                fontSize: '26px',
                color: '#a1a1aa',
                lineHeight: 1.4,
                maxWidth: '900px',
              }}
            >
              {tool.tagline.length > 120 ? tool.tagline.slice(0, 117) + '...' : tool.tagline}
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {/* Quality score */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '8px 16px',
            }}
          >
            <span style={{ fontSize: '28px', fontWeight: 700, color: scoreColor }}>
              {tool.quality_score}
            </span>
            <span style={{ fontSize: '16px', color: '#71717a' }}>Score</span>
          </div>

          {/* Stars */}
          {tool.github_stars > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '22px', color: '#eab308' }}>★</span>
              <span style={{ fontSize: '22px', fontWeight: 600, color: '#d4d4d8' }}>
                {formatNumber(tool.github_stars)}
              </span>
            </div>
          )}

          {/* Maintenance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: maintenanceColors[tool.maintenance] || '#71717a',
              }}
            />
            <span style={{ fontSize: '18px', color: '#a1a1aa', textTransform: 'capitalize' }}>
              {tool.maintenance}
            </span>
          </div>

          {/* License */}
          {tool.license && (
            <span style={{ fontSize: '18px', color: '#71717a' }}>
              {tool.license}
            </span>
          )}

          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '18px', color: '#52525b' }}>toolshelf.dev</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
