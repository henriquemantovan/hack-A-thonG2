import { prisma } from '../../../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id_telegram, loja } = req.body;

  try {
    const nova = await prisma.loja.create({
      data: {
        id_telegram,
        loja,
      },
    });
    res.status(201).json(nova);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar loja' });
  }
}
