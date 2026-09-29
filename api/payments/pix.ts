// Endpoint Serverless Vercel (Node.js) para gerar cobrança Pix Mercado Pago
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  const { paymentId, amount, description, payerEmail, payerName, payerCpfCnpj } = req.body;

  if (!accessToken) {
    // Fallback de demonstração quando a variável ainda não foi inserida no Vercel
    const simulatedPixKey = `00020126580014br.gov.bcb.pix0136jgcode-mp-${paymentId}520400005303986540${Number(amount || 0).toFixed(2)}5802BR5915JGCODE DEV TECH6009SAO PAULO62070503***6304`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
      simulatedPixKey
    )}`;

    return res.status(200).json({
      gatewayTransactionId: `mp_mock_${Date.now()}`,
      qrCodeImage: qrCodeUrl,
      qrCodeCopyPaste: simulatedPixKey,
      note: 'Modo demonstração (defina MP_ACCESS_TOKEN para conexão real Mercado Pago)',
    });
  }

  try {
    const cleanTaxId = (payerCpfCnpj || '').replace(/\D/g, '');
    const isCnpj = cleanTaxId.length > 11;

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Idempotency-Key': `jgcode-${paymentId}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: description || 'Serviços JGcode',
        payment_method_id: 'pix',
        payer: {
          email: payerEmail || 'cliente@jgcode.com',
          first_name: payerName?.split(' ')[0] || 'Cliente',
          last_name: payerName?.split(' ').slice(1).join(' ') || 'JGcode',
          identification: {
            type: isCnpj ? 'CNPJ' : 'CPF',
            number: cleanTaxId || '12345678909',
          },
        },
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(400).json({ error: mpData.message || 'Erro Mercado Pago' });
    }

    const pointOfInteraction = mpData.point_of_interaction?.transaction_data;
    const qrCodeBase64 = pointOfInteraction?.qr_code_base64
      ? `data:image/png;base64,${pointOfInteraction.qr_code_base64}`
      : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
          pointOfInteraction?.qr_code || ''
        )}`;

    return res.status(200).json({
      gatewayTransactionId: String(mpData.id),
      qrCodeImage: qrCodeBase64,
      qrCodeCopyPaste: pointOfInteraction?.qr_code,
      status: mpData.status,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
