import AppError from "@/shared/errors/AppError";
import ApiFeatures from "@/shared/utils/ApiFeatures";
import { ProductRepository } from "./product.repository";
import slugify from "@/shared/utils/slugify";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import prisma from "@/infra/database/database.config";
import { AttributeRepository } from "../attribute/attribute.repository";

type ProductUpdateData = Partial<{
  name: string;
  description: string;
  price: number;
  discount: number;
  images: string[];
  stock: number;
  categoryId?: string;
}>;

export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private attributeRepository: AttributeRepository
  ) { }
  async getAllProducts(queryString: Record<string, any>) {
    const apiFeatures = new ApiFeatures(queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .build();

    const { where, orderBy, skip, take, select } = apiFeatures;

    const finalWhere = where && Object.keys(where).length > 0 ? where : {};

    const totalResults = await this.productRepository.countProducts({
      where: finalWhere,
    });

    const totalPages = Math.ceil(totalResults / take);
    const currentPage = Math.floor(skip / take) + 1;

    const products = await this.productRepository.findManyProducts({
      where: finalWhere,
      orderBy: orderBy || { createdAt: "desc" },
      skip,
      take,
      select,
    });

    return {
      products,
      totalResults,
      totalPages,
      currentPage,
      resultsPerPage: take,
    };
  }

  async getProductById(productId: string) {
    const product = await this.productRepository.findProductById(productId);
    if (!product) {
      throw new AppError(404, "Product not found");
    }
    return product;
  }

  async getProductBySlug(productSlug: string) {
    const product = await this.productRepository.findProductBySlug(productSlug);
    if (!product) {
      throw new AppError(404, "Product not found");
    }
    return product;
  }

  async createProduct(data: {
    name: string;
    sku: string;
    isNew: boolean;
    isTrending: boolean;
    isBestSeller: boolean;
    isFeatured: boolean;
    slug: string;
    description?: string;
    price: number;
    discount: number;
    images?: string[];
    stock: number;
    categoryId?: string;
    attributes?: {
      attributeId: string;
      valueId?: string;
      valueIds?: string[];
      customValue?: string;
    }[];
  }) {
    const { attributes, ...productData } = data;

    // Validate attributes if provided
    if (attributes) {
      const attributeIds = attributes.map((attr) => attr.attributeId);
      const existingAttributes = await prisma.attribute.findMany({
        where: { id: { in: attributeIds } },
      });
      if (existingAttributes.length !== attributeIds.length) {
        throw new AppError(400, "One or more attributes are invalid");
      }

      // Validate valueIds and valueId if provided
      const allValueIds = attributes.flatMap((attr) =>
        attr.valueIds ? attr.valueIds : attr.valueId ? [attr.valueId] : []
      );
      if (allValueIds.length > 0) {
        const existingValues = await prisma.attributeValue.findMany({
          where: { id: { in: allValueIds } },
        });
        if (existingValues.length !== allValueIds.length) {
          throw new AppError(400, "One or more attribute values are invalid");
        }
      }
    }

    // Create product
    const product = await this.productRepository.createProduct(productData);

    // Assign attributes
    if (attributes) {
      await Promise.all(
        attributes.flatMap((attr) => {
          const valueIds = attr.valueIds
            ? attr.valueIds
            : attr.valueId
              ? [attr.valueId]
              : [];
          return valueIds.map((valueId) =>
            this.attributeRepository.assignAttributeToProduct({
              productId: product.id,
              attributeId: attr.attributeId,
              valueId,
              customValue: attr.customValue,
            })
          );
        })
      );
    }

    // Fetch product with attributes
    const productWithAttributes = await this.productRepository.findProductById(
      product.id
    );
    return { product: productWithAttributes };
  }

  async updateProduct(
    productId: string,
    updatedData: Partial<{
      name: string;
      sku: string;
      isNew: boolean;
      isTrending: boolean;
      isBestSeller: boolean;
      isFeatured: boolean;
      slug: string;
      description?: string;
      price: number;
      discount: number;
      images?: string[];
      stock: number;
      categoryId?: string;
      attributes?: {
        attributeId: string;
        valueId?: string;
        customValue?: string;
      }[];
    }>
  ) {
    const existingProduct = await this.productRepository.findProductById(
      productId
    );
    if (!existingProduct) {
      throw new AppError(404, "Product not found");
    }

    const { attributes, ...productData } = updatedData;

    // Update product
    const product = await this.productRepository.updateProduct(
      productId,
      productData
    );

    // Update attributes if provided
    if (attributes) {
      // Delete existing attributes
      await prisma.productAttribute.deleteMany({ where: { productId } });

      // Assign new attributes
      await Promise.all(
        attributes.map((attr) =>
          this.attributeRepository.assignAttributeToProduct({
            productId,
            attributeId: attr.attributeId,
            valueId: attr.valueId,
            customValue: attr.customValue,
          })
        )
      );
    }

    // Fetch updated product with attributes
    return await this.productRepository.findProductById(productId);
  }

  async restockProduct(
    productId: string,
    quantity: number,
    notes?: string,
    userId?: string
  ) {
    if (quantity <= 0) {
      throw new AppError(400, "Quantity must be positive");
    }

    return prisma.$transaction(async (tx) => {
      // Create restock record
      const restock = await this.productRepository.createRestock({
        productId,
        quantity,
        notes,
        userId,
      });

      // Update product stock
      await this.productRepository.updateProductStock(productId, quantity);

      // Log stock movement
      await this.productRepository.createStockMovement({
        productId,
        quantity,
        reason: "restock",
        userId,
      });

      return restock;
    });
  }

  async bulkCreateProducts(file: Express.Multer.File) {
    if (!file) {
      throw new AppError(400, "No file uploaded");
    }

    let records: any[];
    try {
      if (file.mimetype === "text/csv") {
        records = parse(file.buffer.toString(), {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } else if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        records = XLSX.utils.sheet_to_json(sheet);
      } else {
        throw new AppError(400, "Unsupported file format. Use CSV or XLSX");
      }
    } catch (error) {
      throw new AppError(400, "Failed to parse file");
    }

    if (records.length === 0) {
      throw new AppError(400, "File is empty");
    }
    console.log("RECORDS => ", records);

    // Validate and transform records
    const products = records.map((record) => {
      if (!record.name || !record.price || !record.stock) {
        throw new AppError(400, `Invalid record: ${JSON.stringify(record)}`);
      }

      return {
        name: String(record.name),
        slug: slugify(record.name),
        description: record.description
          ? String(record.description)
          : undefined,
        price: Number(record.price),
        discount: record.discount ? Number(record.discount) : 0,
        images: record.images
          ? String(record.images)
            .split(",")
            .map((img: string) => img.trim())
          : [],
        stock: Number(record.stock),
        categoryId: record.categoryId ? String(record.categoryId) : undefined,
        isNew: record.isNew ? Boolean(record.isNew) : false,
        isTrending: record.isTrending ? Boolean(record.isTrending) : false,
        isBestSeller: record.isBestSeller
          ? Boolean(record.isBestSeller)
          : false,
        isFeatured: record.isFeatured ? Boolean(record.isFeatured) : false,
      };
    });

    // Validate categoryIds (if provided)
    const categoryIds = products
      .filter((p) => p.categoryId)
      .map((p) => p.categoryId!);
    if (categoryIds.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true },
      });
      const validCategoryIds = new Set(existingCategories.map((c) => c.id));
      for (const product of products) {
        if (product.categoryId && !validCategoryIds.has(product.categoryId)) {
          throw new AppError(400, `Invalid categoryId: ${product.categoryId}`);
        }
      }
    }

    // Create products
    await this.productRepository.createManyProducts(products);

    return { count: products.length };
  }

  async deleteProduct(productId: string) {
    const product = await this.productRepository.findProductById(productId);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    await this.productRepository.deleteProduct(productId);
  }
}
