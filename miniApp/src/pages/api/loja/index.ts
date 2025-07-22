// pages/api/loja/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id_telegram, nome_loja } = req.body;

    if (!id_telegram || !nome_loja) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
      // Verifica se já existe uma loja com esse ID do Telegram
      const lojaExistente = await prisma.loja.findUnique({
        where: { id_telegram },
      });

      if (lojaExistente) {
        return res.status(400).json({ error: 'Já existe uma loja cadastrada para este usuário' });
      }

      const novaLoja = await prisma.loja.create({
        data: {
          id_telegram,
          nome_loja,
        },
      });

      return res.status(201).json(novaLoja);
    } catch (error) {
      console.error('Erro ao cadastrar loja:', error);
      return res.status(500).json({ error: 'Erro ao cadastrar loja' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}