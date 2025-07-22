// pages/api/loja/[id_telegram].ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id_telegram } = req.query;

  if (req.method === 'GET') {
    try {
      const loja = await prisma.loja.findUnique({
        where: { id_telegram: id_telegram as string },
      });

      if (!loja) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      return res.status(200).json(loja);
    } catch (error) {
      console.error('Erro ao buscar loja:', error);
      return res.status(500).json({ error: 'Erro ao buscar loja' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}

