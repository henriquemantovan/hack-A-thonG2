import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany()
      return res.status(200).json(products)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar produtos' })
    }
  }

  if (req.method === 'POST') {
    const { name, price, photo, quant, category } = req.body
    try {
      const newProduct = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price),
          photo,
          quant,
          category
        }
      })
      return res.status(201).json(newProduct)
    } catch (error) {
  console.error("Erro ao cadastrar produto:", error);
  return res.status(500).json({ error: 'Erro ao cadastrar o produto' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
