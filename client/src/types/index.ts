export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[]; // We mapped this in backend
  categoryId: string;
  category?: Category;
  featured: boolean;
  inStock: boolean;
  slug: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating?: number;
  reviewCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface CartItem extends Product {
  cartId: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
}
