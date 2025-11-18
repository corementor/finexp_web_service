import { AbstractBaseDto } from '../util/abstract-base-dto';
import { EOrderHistoryStatus } from '../util/e-order-history-status';
import { SalesOrderDTO } from './sales-order-dto';

export class SalesOrderHistoryDto extends AbstractBaseDto {
  salesOrder?: SalesOrderDTO;
  status?: EOrderHistoryStatus;
  comment?: string;
}
