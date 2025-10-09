import { AbstractBaseDto } from '../util/abstract-base-dto';
import { ProductTypeDto } from './productType-dto';
import { PurchaseOrderDto } from './purchase-order-dto';

export class ProductOrderItemDto extends AbstractBaseDto {
  quantity?: number;
  unitPrice?: number;
  productName?: string;
  size?: number;
  taxAmount?: number;
  totalTax?: number;
  totalPriceWithTax?: number;
  productType?: ProductTypeDto;
  purchaseOrderEntity?: PurchaseOrderDto;
}
