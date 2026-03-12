import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { C, Modal, Btn } from '../ui/primitives';

interface OTPSignModalProps {
  open: boolean;
  onCancel: () => void;
  onRequestOtp: () => Promise<void>;
  onSign: (otpCode: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const OTP_EXPIRY_SECONDS = 30 * 60;

const OTPSignModal: React.FC<OTPSignModalProps> = ({
  open, onCancel, onRequestOtp, onSign, loading = false, error = null,
}) => {
  const { t } = useTranslation();
  const [otpCode, setOtpCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [otpRequested, setOtpRequested] = useState(false);

  useEffect(() => {
    if (!open) { setOtpCode(''); setTimeLeft(OTP_EXPIRY_SECONDS); setOtpRequested(false); }
  }, [open]);

  useEffect(() => {
    if (!otpRequested || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [otpRequested, timeLeft]);

  const handleRequestOtp = useCallback(async () => {
    await onRequestOtp(); setOtpRequested(true); setTimeLeft(OTP_EXPIRY_SECONDS);
  }, [onRequestOtp]);

  const handleSign = useCallback(async () => {
    if (otpCode.length === 6) await onSign(otpCode);
  }, [otpCode, onSign]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isExpired = timeLeft <= 0;

  return (
    <Modal open={open} onClose={onCancel} title={`🔐 ${t('otp.title')}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!otpRequested ? (
          <Btn onClick={handleRequestOtp} loading={loading} style={{ width: '100%' }}>
            {t('requests.requestOtp')}
          </Btn>
        ) : (
          <>
            <div style={{
              padding: '10px 14px', borderRadius: 6, fontSize: 13,
              background: isExpired ? C.dangerBg : C.accentLight,
              color: isExpired ? C.danger : C.accent,
            }}>
              {isExpired ? t('otp.codeExpired') : `${t('otp.codeSent')} — ${formatTime(timeLeft)}`}
            </div>

            <input
              maxLength={6}
              placeholder={t('otp.enterCode')}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              style={{
                textAlign: 'center', fontSize: 28, letterSpacing: 10, fontWeight: 700,
                padding: '14px 16px', border: `1px solid ${C.inputBorder}`, borderRadius: 8,
                outline: 'none', width: '100%',
              }}
            />

            {error && (
              <div style={{ background: C.dangerBg, color: C.danger, padding: '8px 12px', borderRadius: 6, fontSize: 12 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <Btn variant="secondary" onClick={handleRequestOtp} disabled={!isExpired} loading={loading}>
                🔄 {t('otp.requestNewCode')}
              </Btn>
              <Btn onClick={handleSign} disabled={otpCode.length !== 6 || isExpired} loading={loading}>
                {t('documents.sign')}
              </Btn>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default OTPSignModal;
