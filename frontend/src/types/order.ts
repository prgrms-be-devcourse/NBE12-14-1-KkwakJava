export interface OrderItemResponse {
  orderItemId: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  itemTotalPrice: number;
}

export interface OrderResponse {
  orderId: number;
  email: string;
  postalCode: string;
  address: string;
  orderDate: string;
  totalAmount: number;
  items: OrderItemResponse[];
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderUpdateRequest {
  postalCode: string;
  address: string;
  items: OrderItemRequest[];
}

export interface OrderCreateRequest {
  email: string;
  postalCode: string;
  address: string;
  items: OrderItemRequest[];
}