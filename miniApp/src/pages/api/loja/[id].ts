import { prisma } from '../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string);

  const loja = await prisma.loja.findUnique({
    where: { id_telegram: id },
  });

  if (!loja) return res.status(404).json({ error: 'Loja não encontrada' });

  res.status(200).json(loja);
}
