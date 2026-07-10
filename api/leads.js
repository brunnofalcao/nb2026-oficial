export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, cf_origem = 'site-nutricaobrasil', cf_pagina = 'home' } = req.body;

  // Validação mínima
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const apiKey = process.env.RD_STATION_API_KEY;
  if (!apiKey) {
    console.error('[RD] API Key não configurada no Vercel');
    return res.status(500).json({ error: 'Configuração faltando' });
  }

  try {
    // Payload para RD Station API v1
    const payload = {
      email: email,
      name: name || 'Lead sem nome',
      identificador: 'LeadNB',
      cf_origem: cf_origem,
      cf_pagina: cf_pagina,
    };

    // Tenta endpoint padrão RD Station
    const response = await fetch('https://api.rd.services/platform/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[RD] Erro:', response.status, data);
      return res.status(response.status).json({ error: 'Erro ao enviar para RD', details: data });
    }

    console.log('[RD] Lead enviado:', email);
    return res.status(200).json({ success: true, contact_id: data.id });
  } catch (err) {
    console.error('[RD] Exception:', err.message);
    return res.status(500).json({ error: 'Erro ao processar', message: err.message });
  }
}
