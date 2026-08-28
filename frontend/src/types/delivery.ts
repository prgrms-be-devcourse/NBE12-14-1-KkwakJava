export interface DeliveryItemResponse {
  productId: number;
  productName: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  itemTotalPrice: number;
}

export interface DeliveryOrderResponse {
  deliveryId: number;
  email: string;
  postalCode: string;
  address: string;
  orderDate: string;
  deliveryCompleted: boolean;
  totalAmount: number;
  items: DeliveryItemResponse[];
}