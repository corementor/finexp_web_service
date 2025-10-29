import { AbstractBaseDto } from '../util/abstract-base-dto';
import { EPurchaseOrderHistoryStatus } from '../util/e-purchase-order-history-status';
import { PurchaseOrderDto } from './purchase-order-dto';

export class PurchaseOrderHistoryDto extends AbstractBaseDto {
  purchaseOrder?: PurchaseOrderDto;
  status?: EPurchaseOrderHistoryStatus;
  comment?: string;
}
