import { AbstractBaseDto } from '../util/abstract-base-dto';
import { EOrderHistoryStatus } from '../util/e-order-history-status';
import { SalesOrderItemDTO } from './sales-order-item-dto';

export class SalesOrderDTO extends AbstractBaseDto {
  saleCode?: string;
  saleDate?: string;
  totalPrice?: number;
  orderItems?: SalesOrderItemDTO[] = [];
  status?: EOrderHistoryStatus;
}
