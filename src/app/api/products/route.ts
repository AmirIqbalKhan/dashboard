import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    const products = await prisma.product.findMany({
      where: {
        ...(category && { category }),
        ...(status && { status }),
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, sku, stock, category, status, images } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        sku,
        stock,
        category,
        status,
        images,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 