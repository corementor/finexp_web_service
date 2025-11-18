import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from './service/dashboard-service';
import { DashboardReportDto } from '../../../common/dto/report/dasboard-report-dto';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  dashboardReport?: DashboardReportDto;
  isLoading = false;

  // Computed stats from API data
  get stats() {
    return {
      totalPurchaseOrders: this.dashboardReport?.purchaseOrderReport?.totalPurchaseOrders || 0,
      totalSalesOrders: this.dashboardReport?.salesOrderReportDto?.totalSalesOrders || 0,
      totalProductTypes: this.dashboardReport?.totalProductTypes || 0,
      totalUsers: this.dashboardReport?.totalUsers || 0,
    };
  }

  // Purchase Order breakdown
  get purchaseOrderStats() {
    const poReport = this.dashboardReport?.purchaseOrderReport; // Changed here
    console.log('Purchase Order Report:', poReport); // Debug log

    return {
      created: poReport?.totalCreated || 0,
      submitted: poReport?.totalSubmitted || 0,
      approved: poReport?.totalApproved || 0,
      returned: poReport?.totalReturned || 0,
    };
  }

  // Sales Order breakdown
  get salesOrderStats() {
    const soReport = this.dashboardReport?.salesOrderReportDto;
    console.log('Sales Order Report:', soReport); // Debug log

    return {
      created: soReport?.totalCreated || 0,
      submitted: soReport?.totalSubmitted || 0,
      approved: soReport?.totalApproved || 0,
      returned: soReport?.totalReturned || 0,
    };
  }

  constructor(private dashboardService: DashboardService, private toaster: ToasterService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.dashboardService.getDashboardReport().subscribe({
      next: (report) => {
        this.dashboardReport = report;
        this.isLoading = false;
        console.log('Dashboard Report Loaded:', report);
        console.log('Purchase Order Report:', report.purchaseOrderReport); // Changed here
        console.log('Sales Order Report:', report.salesOrderReportDto);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading dashboard data:', error);
        this.toaster.error('Error', 'Failed to load dashboard data');
      },
    });
  }

  getStatusPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
