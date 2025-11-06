import { PurchaseOrderReportDto } from './purchase-order-report';
import { SalesOrderReportDto } from './sales-order-report-dto';

export class DashboardReportDto {
  purchaseOrderReport?: PurchaseOrderReportDto; // Changed from purchaseOrderReportDto
  salesOrderReportDto?: SalesOrderReportDto;
  totalProductTypes?: number;
  totalUsers?: number;
}
