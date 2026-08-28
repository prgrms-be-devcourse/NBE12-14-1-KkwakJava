export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}