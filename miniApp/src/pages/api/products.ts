import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany()
      return res.status(200).json(products)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      return res.status(500).json({ error: 'Erro ao buscar produtos' })
    }
  }

  if (req.method === 'POST') {
    const { name, price, photo, quant, category } = req.body

    if (!name || !price || !quant || !category) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    if (!photo) {
      return res.status(400).json({ error: 'Imagem é obrigatória' })
    }

    try {
      const newProduct = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price),
          photo, 
          quant: parseInt(quant),
          category
        }
      })
      return res.status(201).json(newProduct)
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      return res.status(500).json({ error: 'Erro ao cadastrar o produto' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID do produto é obrigatório' })
    }

    try {
      const product = await prisma.product.findUnique({
        where: { id }
      })

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' })
      }

      // Remove o produto do banco
      await prisma.product.delete({
        where: { id }
      })

      if (product.photo && !product.photo.startsWith('http')) {
        const fs = require('fs')
        const path = require('path')
        const imagePath = path.join(process.cwd(), 'public', 'uploads', product.photo)
        
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }

      return res.status(200).json({ message: 'Produto excluído com sucesso' })
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      return res.status(500).json({ error: 'Erro ao excluir produto' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}