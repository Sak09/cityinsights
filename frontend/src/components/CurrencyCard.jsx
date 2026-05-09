import React from 'react';

const CURRENCY_FLAGS = {
  USD: '🇺🇸', GBP: '🇬🇧', JPY: '🇯🇵', INR: '🇮🇳',
  AUD: '🇦🇺', AED: '🇦🇪', BRL: '🇧🇷', EUR: '🇪🇺',
  CNY: '🇨🇳', EGP: '🇪🇬',
};

/**
 * CurrencyCard — shows live exchange rate vs INR.
 */
export default function CurrencyCard({ currency, rateToINR, rateToUSD }) {
  const flag = CURRENCY_FLAGS[currency] || '💱';
  const isINR = currency === 'INR';

  return (
    <div className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{flag}</div>

      <p style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.05em' }}>
        {currency}
      </p>

      {isINR ? (
        <p style={{ fontSize: 11, color: '#68d391', marginTop: 8, fontWeight: 600 }}>
          Base Currency (₹)
        </p>
      ) : (
        <>
          {rateToINR != null ? (
            <div style={{
              marginTop: 10, padding: '6px 10px',
              background: '#1a3a26', border: '1px solid #48bb7844',
              borderRadius: 8,
            }}>
              <p style={{ fontSize: 11, color: '#718096' }}>1 {currency} equals</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#68d391' }}>
                ₹{rateToINR.toFixed(2)}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#4a5568', marginTop: 8 }}>Rate unavailable</p>
          )}

          {rateToUSD != null && (
            <p style={{ fontSize: 11, color: '#718096', marginTop: 6 }}>
              = <span style={{ color: '#a0aec0' }}>${rateToUSD.toFixed(4)} USD</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
