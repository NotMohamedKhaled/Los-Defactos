export interface IProductVariant {
  color: string;
  size: string;
  stock: number;
  sku: string;
  price?: number;
}

export interface IProducts {
  _id: string;
  title: string;
  desc: string;
  slug: string;
  price: number;
  /** Computed by API from variants — not stored on product */
  stock: number;
  isInStock: boolean;
  isAboutToBeOut: boolean;
  keywords: string[];
  tags: string[];
  /** Derived by API from variants — not stored on product */
  colors: string[];
  /** Derived by API from variants — not stored on product */
  sizes: string[];
  specs: string[];
  variants: IProductVariant[];
  category?: string | { _id: string; name: string };
  subCategory?: string | { _id: string; name: string };
  imgUrl: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface IProductsResponse {
  data: IProducts[];
  message: string;
}
