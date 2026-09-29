import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { paymentGatewayManager, type PaymentChargeResult } from '../../services/payment/paymentProvider';
import { StorageService } from '../../services/storageService';
import type { Payment } from '../../types';
import { Check, Copy, QrCode, ShieldCheck } from 'lucide-react';

interface PixPaymentModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  payment,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [chargeData, setChargeData] = useState<PaymentChargeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isOpen && payment && payment.status === 'PENDING') {
      loadPixCharge();
    } else {
      setChargeData(null);
      setCopied(false);
    }
  }, [isOpen, payment]);

  const loadPixCharge = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const provider = paymentGatewayManager.getActiveProvider();
      const result = await provider.createPixCharge({
        paymentId: payment.id,
        amount: payment.amount,
        description: payment.title,
        payerName: 'Cliente JGcode',
        payerEmail: 'cliente@jgcode.com',
      });
      setChargeData(result);
      StorageService.attachQRCode(payment.id, result.qrCodeImage, result.qrCodeCopyPaste);
    } catch (e) {
      console.error('Erro ao gerar cobrança Pix:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (chargeData?.qrCodeCopyPaste) {
      navigator.clipboard.writeText(chargeData.qrCodeCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSimulatePayment = () => {
    if (!payment) return;
    setIsConfirming(true);
    setTimeout(() => {
      StorageService.markAsPaid(payment.id, chargeData?.gatewayTransactionId);
      setIsConfirming(false);
      onPaymentSuccess?.();
      onClose();
    }, 1200);
  };

  if (!payment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pagamento Instantâneo via Pix"
      subtitle={`Processado de forma segura via ${paymentGatewayManager.getActiveProvider().name}`}
      maxWidth="md"
    >
      <div className="space-y-6 text-center">
        {/* Resumo do Valor */}
        <div className="bg-gray-50/80 rounded-apple p-4 border border-gray-100 flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-apple-secondary font-semibold">
            {payment.title}
          </span>
          <span className="text-2xl font-bold text-apple-text tracking-tight mt-1">
            {formatCurrency(payment.amount)}
          </span>
          {payment.installmentLabel && (
            <span className="text-xs text-apple-secondary mt-0.5">
              Ref: {payment.installmentLabel}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-apple-blue" />
            <p className="text-xs text-apple-secondary">Conectando ao gateway e gerando QR Code Pix...</p>
          </div>
        ) : chargeData ? (
          <div className="space-y-5">
            {/* Imagem do QR Code */}
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white rounded-apple-lg border border-gray-200/80 shadow-apple-sm inline-block">
                <img
                  src={chargeData.qrCodeImage}
                  alt="QR Code Pix"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-apple-sm"
                />
              </div>
              <p className="text-xs text-apple-secondary mt-2 flex items-center gap-1.5">
                <QrCode size={14} />
                Abra o app do seu banco e aponte a câmera para pagar
              </p>
            </div>

            {/* Código Pix Copia e Cola */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-apple-secondary block">
                Pix Copia e Cola:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={chargeData.qrCodeCopyPaste}
                  className="flex-1 bg-gray-50 border border-gray-200 text-xs rounded-apple px-3 py-2 text-gray-600 font-mono select-all focus:outline-none"
                />
                <Button
                  variant={copied ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="mr-1 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Simulação para demonstração & Confirmação */}
            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={handleSimulatePayment}
                isLoading={isConfirming}
              >
                <ShieldCheck size={16} className="mr-1.5 text-emerald-600" />
                Simular Confirmação Pix
              </Button>
              <Button variant="ghost" className="w-full text-xs" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-rose-500">Não foi possível carregar o QR Code. Tente novamente.</p>
        )}
      </div>
    </Modal>
  );
};
