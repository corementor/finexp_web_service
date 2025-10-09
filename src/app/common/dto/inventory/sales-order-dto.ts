import { AbstractBaseDto } from '../util/abstract-base-dto';
import { SalesOrderItemDTO } from './sales-order-item-dto';

export class SalesOrderDTO extends AbstractBaseDto {
  saleCode?: string;
  saleDate?: string;
  totalPrice?: number;
  orderItems?: SalesOrderItemDTO[] = [];
}
