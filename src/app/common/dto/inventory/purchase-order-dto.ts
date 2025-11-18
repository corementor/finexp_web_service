import { AbstractBaseDto } from '../util/abstract-base-dto';
import { EOrderHistoryStatus } from '../util/e-order-history-status';
import { ProductOrderItemDto } from './product-order-item-dto';

export class PurchaseOrderDto extends AbstractBaseDto {
  purchaseCode?: string;
  purchaseDate?: string;
  totalPrice?: number;
  orderItems: ProductOrderItemDto[] = [];
  status?: EOrderHistoryStatus;
}
