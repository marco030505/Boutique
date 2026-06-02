export type ProductCategory =
  | "Vestidos"
  | "Blusas"
  | "Camisas"
  | "Pantalones"
  | "Faldas"
  | "Shorts";
export type ProductGender = "Damas" | "Caballeros" | "Unisex";

export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  gender: ProductGender;
  sizes: string[];
  stock: number;
  image: string;
  product_code: string;
}

export const MOCK_PRODUCTS: Product[] = [
  // ── Damas ──
  {
    id: 1,
    name: "Vestido Floral Midi",
    price: 850,
    category: "Vestidos",
    gender: "Damas",
    sizes: ["XS", "S", "M", "L"],
    stock: 8,
    image: "/images/dresses.png",
    product_code: "VD0001",
  },
  {
    id: 2,
    name: "Vestido Wrap Negro",
    price: 1200,
    category: "Vestidos",
    gender: "Damas",
    sizes: ["S", "M", "L", "XL"],
    stock: 5,
    image: "/images/dresses.png",
    product_code: "VD0002",
  },
  {
    id: 3,
    name: "Vestido Verano Rosa",
    price: 650,
    category: "Vestidos",
    gender: "Damas",
    sizes: ["XS", "S", "M"],
    stock: 10,
    image: "/images/dresses.png",
    product_code: "VD0003",
  },
  {
    id: 4,
    name: "Blusa Seda Elegante",
    price: 480,
    category: "Blusas",
    gender: "Damas",
    sizes: ["S", "M", "L"],
    stock: 12,
    image: "/images/tops-women.png",
    product_code: "BL0001",
  },
  {
    id: 5,
    name: "Top Casual Rosa",
    price: 320,
    category: "Blusas",
    gender: "Damas",
    sizes: ["XS", "S", "M", "L"],
    stock: 15,
    image: "/images/tops-women.png",
    product_code: "BL0002",
  },
  {
    id: 6,
    name: "Blusa Floral Crop",
    price: 390,
    category: "Blusas",
    gender: "Damas",
    sizes: ["S", "M"],
    stock: 7,
    image: "/images/tops-women.png",
    product_code: "BL0003",
  },
  {
    id: 7,
    name: "Falda Midi Plisada",
    price: 560,
    category: "Faldas",
    gender: "Damas",
    sizes: ["XS", "S", "M", "L"],
    stock: 9,
    image: "/images/tops-women.png",
    product_code: "FL0001",
  },
  {
    id: 8,
    name: "Short Denim Dama",
    price: 420,
    category: "Shorts",
    gender: "Damas",
    sizes: ["S", "M", "L"],
    stock: 6,
    image: "/images/tops-women.png",
    product_code: "SH0001",
  },
  // ── Caballeros ──
  {
    id: 9,
    name: "Camisa Azul Marino",
    price: 580,
    category: "Camisas",
    gender: "Caballeros",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 20,
    image: "/images/men-shirts.png",
    product_code: "CM0001",
  },
  {
    id: 10,
    name: "Polo Blanco Clásico",
    price: 350,
    category: "Camisas",
    gender: "Caballeros",
    sizes: ["S", "M", "L", "XL"],
    stock: 18,
    image: "/images/men-shirts.png",
    product_code: "CM0002",
  },
  {
    id: 11,
    name: "Pantalón Chino Beige",
    price: 720,
    category: "Pantalones",
    gender: "Caballeros",
    sizes: ["30", "32", "34", "36"],
    stock: 11,
    image: "/images/men-shirts.png",
    product_code: "PT0001",
  },
  {
    id: 12,
    name: "Short Casual Hombre",
    price: 390,
    category: "Shorts",
    gender: "Caballeros",
    sizes: ["S", "M", "L", "XL"],
    stock: 14,
    image: "/images/men-shirts.png",
    product_code: "SH0002",
  },
];

export const CATEGORIES: ProductCategory[] = [
  "Vestidos",
  "Blusas",
  "Camisas",
  "Pantalones",
  "Faldas",
  "Shorts",
];
