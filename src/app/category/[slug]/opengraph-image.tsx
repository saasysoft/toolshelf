import { ImageResponse } from 'next/og';
import { getCategoryBySlug } from '@/lib/queries';

export const runtime = 'edge';
export const alt = 'Category details';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
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
          Category Not Found — ToolShelf
        </div>
      ),
      { ...size },
    );
  }

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

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {category.icon && (
            <span style={{ fontSize: '64px' }}>{category.icon}</span>
          )}
          <div
            style={{
              fontSize: '60px',
              fontWeight: 800,
              color: '#fafafa',
              lineHeight: 1.1,
            }}
          >
            {category.name}
          </div>
          {category.description && (
            <div
              style={{
                fontSize: '26px',
                color: '#a1a1aa',
                lineHeight: 1.4,
                maxWidth: '900px',
              }}
            >
              {category.description.length > 140
                ? category.description.slice(0, 137) + '...'
                : category.description}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
              {category.tool_count}
            </span>
            <span style={{ fontSize: '18px', color: '#71717a' }}>tools</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '18px', color: '#52525b' }}>toolshelf.dev</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
