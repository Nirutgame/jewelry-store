export interface ProductType {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  images: string;
  video?: string;
  category: string;
  material: string;
  materialEn: string;
  stock: number;
  featured: boolean;
  createdAt: string;
  avgRating?: number;
  totalReviews?: number;
}

export interface CartItemType {
  id: string;
  quantity: number;
  userId: string;
  productId: string;
  product: ProductType;
  createdAt: string;
}

export interface UserType {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export interface CartSessionItem {
  productId: string;
  quantity: number;
}

export interface OrderItemType {
  id: string;
  orderId: string;
  productId: string;
  product: ProductType;
  quantity: number;
  price: number;
}

export interface OrderType {
  id: string;
  userId: string;
  items: OrderItemType[];
  total: number;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  zipcode: string;
  note: string | null;
  paymentMethod: string;
  paymentStatus: string;
  stripePaymentIntentId?: string | null;
  slipImage?: string | null;
  paymentConfirmedAt?: string | null;
  createdAt: string;
}

export interface WishlistItemType {
  id: string;
  userId: string;
  productId: string;
  product: ProductType;
  createdAt: string;
}

export type CategoryType = string;
