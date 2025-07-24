import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { useTonClient } from '../../hooks/useTonClient';
import { useTonConnect } from '../../hooks/useTonConnect';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const lojas = await prisma.lojas.findMany();
      return res.status(200).json(lojas);
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
      return res.status(500).json({ error: 'Erro ao buscar lojas' });
    }
  }

  if (req.method === 'POST') {
    const { id, first_name, nome_loja, address } = req.body;
  

    if (!id || !first_name || !nome_loja || !address) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
      const novaLoja = await prisma.lojas.create({
        data: {
          id,
          first_name,
          nome_loja,
          address
        }
      });
      return res.status(201).json(novaLoja);
    } catch (error) {
      console.error('Erro ao cadastrar loja:', error);
      return res.status(500).json({ error: 'Erro ao cadastrar loja' });
    }
  }

  if (req.method === 'PUT') {
    const { id, first_name, nome_loja, address } = req.body;

    if (!id || !first_name || !nome_loja) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    try {
      const lojaExistente = await prisma.lojas.findUnique({
        where: { id }
      });

      if (!lojaExistente) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      const lojaAtualizada = await prisma.lojas.update({
        where: { id },
        data: {
          first_name,
          nome_loja,
          address
        }
      });

      return res.status(200).json(lojaAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar loja:', error);
      return res.status(500).json({ error: 'Erro ao atualizar loja' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID da loja é obrigatório' });
    }

    try {
      const loja = await prisma.lojas.findUnique({
        where: { id }
      });

      if (!loja) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      await prisma.lojas.delete({
        where: { id }
      });

      return res.status(200).json({ message: 'Loja excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir loja:', error);
      return res.status(500).json({ error: 'Erro ao excluir loja' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
