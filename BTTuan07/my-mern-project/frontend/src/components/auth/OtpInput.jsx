import { useEffect } from 'react';

export default function OtpInput({ length = 6, onComplete, disabled = false }) {
  useEffect(() => {
    if (!disabled) {
      const timer = setTimeout(() => {
        const first = document.getElementById('otp-0');
        if (first) first.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  const handleChange = (index, e) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) {
      e.target.value = '';
      return;
    }
    if (val.length > 1) {
      e.target.value = val.charAt(val.length - 1);
    }
    if (val && index < length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    checkComplete();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!e.target.value && index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const checkComplete = () => {
    let otp = '';
    for (let i = 0; i < length; i++) {
      const el = document.getElementById(`otp-${i}`);
      otp += el?.value || '';
    }
    if (otp.length === length && onComplete) {
      onComplete(otp);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '');
    for (let i = 0; i < Math.min(text.length, length); i++) {
      const el = document.getElementById(`otp-${i}`);
      if (el) el.value = text[i];
    }
    const last = document.getElementById(`otp-${Math.min(text.length, length) - 1}`);
    last?.focus();
    setTimeout(checkComplete, 50);
  };

  return (
    <div 
      className="flex justify-center gap-2" 
      onPaste={handlePaste}
      style={{ userSelect: 'none' }}
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength="1"
          autoComplete="off"
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          style={{ 
            width: '48px', 
            height: '56px',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            border: '2px solid #d1d5db',
            borderRadius: '12px',
            outline: 'none',
            backgroundColor: disabled ? '#f3f4f6' : '#fff',
            color: disabled ? '#9ca3af' : '#111827',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
      ))}
    </div>
  );
}
