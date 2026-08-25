/**
 * ShareCard — offscreen element captured by html2canvas.
 * Uses ONLY inline styles (no Tailwind classes) to guarantee
 * reliable rendering when html2canvas serialises the DOM.
 */
import type { PersonBalance, Settlement } from '../types';
import { formatCurrency } from '../utils';

interface ShareCardProps {
  totalBill: number;
  balances: PersonBalance[];
  settlements: Settlement[];
  cardRef: React.RefObject<HTMLDivElement | null>;
}

const INDIGO = '#4f46e5';
const GREEN = '#10b981';
const RED = '#ef4444';
const GRAY_900 = '#111827';
const GRAY_500 = '#6b7280';
const GRAY_100 = '#f3f4f6';
const WHITE = '#ffffff';
const BG = '#f8fafc';

export function ShareCard({ totalBill, balances, settlements, cardRef }: ShareCardProps) {
  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      style={{
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '480px',
        backgroundColor: BG,
        fontFamily: "'Segoe UI', 'Inter', Arial, sans-serif",
        padding: '0',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: INDIGO,
          padding: '28px 28px 22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            🧾
          </div>
          <span style={{ color: WHITE, fontWeight: 700, fontSize: '18px', letterSpacing: '-0.3px' }}>
            SplitBill
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Total Tagihan
        </p>
        <p style={{ color: WHITE, fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
          {formatCurrency(totalBill)}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 28px 24px' }}>

        {/* Per-person balances */}
        <p style={{ fontSize: '11px', fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          Rincian Per Orang
        </p>
        <div style={{ background: WHITE, borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
          {balances.map((b, i) => {
            const isPos = b.balance > 0;
            const isNeg = b.balance < 0;
            return (
              <div
                key={b.person.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '11px 16px',
                  borderBottom: i < balances.length - 1 ? '1px solid #f3f4f6' : 'none',
                  gap: '12px',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isPos ? '#ecfdf5' : isNeg ? '#fef2f2' : GRAY_100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isPos ? GREEN : isNeg ? RED : GRAY_500,
                    flexShrink: 0,
                  }}
                >
                  {b.person.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + detail */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: GRAY_900 }}>
                    {b.person.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: GRAY_500, marginTop: '1px' }}>
                    Bagian {formatCurrency(b.share)} · Bayar {formatCurrency(b.paid)}
                  </p>
                </div>

                {/* Balance */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: isPos ? GREEN : isNeg ? RED : GRAY_500 }}>
                    {isPos ? '+' : ''}{formatCurrency(b.balance)}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: GRAY_500, marginTop: '1px' }}>
                    {isPos ? 'terima' : isNeg ? 'bayar' : 'lunas'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Settlement */}
        <p style={{ fontSize: '11px', fontWeight: 700, color: GRAY_500, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          Transfer Yang Perlu Dilakukan
        </p>

        {settlements.length === 0 ? (
          <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '14px', color: GREEN, fontWeight: 600 }}>
              🎉 Semua sudah lunas!
            </p>
          </div>
        ) : (
          <div style={{ background: WHITE, borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            {settlements.map((s, i) => (
              <div
                key={`${s.from.id}-${s.to.id}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '11px 16px',
                  borderBottom: i < settlements.length - 1 ? '1px solid #f3f4f6' : 'none',
                  gap: '8px',
                }}
              >
                {/* From badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: RED, flexShrink: 0,
                  }}>
                    {s.from.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: GRAY_900 }}>
                    {s.from.name}
                  </span>
                </div>

                {/* Arrow + amount */}
                <div style={{ textAlign: 'center', padding: '0 6px' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: INDIGO }}>
                    {formatCurrency(s.amount)}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: GRAY_500 }}>→</p>
                </div>

                {/* To badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: GRAY_900 }}>
                    {s.to.name}
                  </span>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: GREEN, flexShrink: 0,
                  }}>
                    {s.to.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <p style={{ margin: '20px 0 0', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
          Dibuat dengan SplitBill · {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
