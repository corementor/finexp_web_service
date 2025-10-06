import { ProductType } from '../../../pages/apps/inventory/product-type/product-type';
import { AbstractBaseDto } from '../util/abstract-base-dto';
import { ProductTypeDto } from './productType-dto';
import { PurchaseOrderDto } from './purchase-order-dto';

export class ProductOrderItemDto extends AbstractBaseDto {
  quantity?: number;
  unitPrice?: number;
  productName?: string;
  size?: number;
  taxRate?: number;
  totalTax?: number;
  totalPriceWithTax?: number;
  productTypeId?: ProductTypeDto;
  purchaseOrderEntity?: PurchaseOrderDto;
}
