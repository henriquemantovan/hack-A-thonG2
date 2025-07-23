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
    const { name, price, quant, category, photo, id_vendor } = req.body;

    if (!name || !price || !quant || !category) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    if (!photo) {
      return res.status(400).json({ error: 'Imagem é obrigatória' })
    }

    if (!id_vendor) {
      return res.status(400).json({ error: 'ID do vendedor é obrigatório' })
    }

    try {
      const newProduct = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price),
          photo, 
          quant: parseInt(quant),
          category,
          id_vendor, 
        }
      })
      return res.status(201).json(newProduct)
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      return res.status(500).json({ error: 'Erro ao cadastrar o produto' });
    }
  }

  if (req.method === 'PUT') {
    const { id, name, price, photo, quant, category, id_vendor } = req.body

    if (!id || !name || !price || !quant || !category) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    try {
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      })

      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto não encontrado' })
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name,
          price: parseFloat(price),
          photo: photo || existingProduct.photo, 
          quant: parseInt(quant),
          category,
          id_vendor 
        }
      })
      
      return res.status(200).json(updatedProduct)
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      return res.status(500).json({ error: 'Erro ao atualizar o produto' });
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