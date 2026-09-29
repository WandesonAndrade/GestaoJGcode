export interface PaymentChargeParams {
  paymentId: string;
  amount: number;
  description: string;
  payerName: string;
  payerEmail: string;
  payerCpfCnpj?: string;
}

export interface PaymentChargeResult {
  gatewayTransactionId: string;
  qrCodeImage: string; // URL ou Data URI do QR Code
  qrCodeCopyPaste: string; // Linha digitável Pix copia e cola
  expiresAt?: string;
}

export interface IPaymentProvider {
  readonly id: string;
  readonly name: string;
  createPixCharge(params: PaymentChargeParams): Promise<PaymentChargeResult>;
  checkStatus?(gatewayTransactionId: string): Promise<'PENDING' | 'PAID' | 'EXPIRED'>;
}

/**
 * Provedor do Mercado Pago
 * Preparado para comunicação com Serverless Function / Vercel API
 * com fallback inteligente para simulação visual de QR Code Pix.
 */
export class MercadoPagoProvider implements IPaymentProvider {
  readonly id = 'mercadopago';
  readonly name = 'Mercado Pago';

  async createPixCharge(params: PaymentChargeParams): Promise<PaymentChargeResult> {
    try {
      // Se houver backend serverless ativo (/api/payments/pix)
      const res = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend ainda não deployed ou rodando em modo client-only
    }

    // Gerador de QR Code Pix demonstrativo de alta fidelidade
    const simulatedPixKey = `00020126580014br.gov.bcb.pix0136jgcode-mp-${params.paymentId}520400005303986540${params.amount.toFixed(2)}5802BR5915JGCODE DEV TECH6009SAO PAULO62070503***6304`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
      simulatedPixKey
    )}`;

    return {
      gatewayTransactionId: `mp_tx_${Date.now()}`,
      qrCodeImage: qrCodeUrl,
      qrCodeCopyPaste: simulatedPixKey,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
    };
  }

  async checkStatus(): Promise<'PENDING' | 'PAID' | 'EXPIRED'> {
    return 'PENDING';
  }
}

/**
 * Gerenciador de Gateway trocável
 */
class PaymentGatewayManager {
  private activeProvider: IPaymentProvider;
  private providers: Map<string, IPaymentProvider> = new Map();

  constructor() {
    const mp = new MercadoPagoProvider();
    this.providers.set(mp.id, mp);
    this.activeProvider = mp;
  }

  registerProvider(provider: IPaymentProvider) {
    this.providers.set(provider.id, provider);
  }

  setProvider(providerId: string) {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provedor de pagamento ${providerId} não encontrado.`);
    }
    this.activeProvider = provider;
  }

  getActiveProvider(): IPaymentProvider {
    return this.activeProvider;
  }
}

export const paymentGatewayManager = new PaymentGatewayManager();
