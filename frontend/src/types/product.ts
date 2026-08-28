export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

export interface ProductCreateRequest {
  name: string;
  price: number;
  imageUrl: string;
}

export interface ProductUpdateRequest {
  name: string;
  price: number;
  imageUrl: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}