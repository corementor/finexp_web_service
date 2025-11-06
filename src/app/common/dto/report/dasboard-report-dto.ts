import { PurchaseOrderReportDto } from './purchase-order-report';
import { SalesOrderReportDto } from './sales-order-report-dto';

export class DashboardReportDto {
  purchaseOrderReportDto?: PurchaseOrderReportDto;
  salesOrderReportDto?: SalesOrderReportDto;
  totalProductTypes?: number;
  totalUsers?: number;
}
