import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Color, LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { CommonService } from '../../services/common.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from "@angular/forms";

interface ChartData {
  name: string;
  value?: number;
  series?: { name: string; value: number }[];
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgxChartsModule, CommonModule, NzSelectModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  colorSchemeRevenue: Color = {
    name: 'users',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2563eb']
  };
  legendPosition = LegendPosition.Below;
  statusColorScheme: Color = {
    name: 'revenue',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#22c55e', '#facc15', '#3b82f6']
  };

  revenueChartData: ChartData[] = [];
  projectStatusData: ChartData[] = [];
  dashboardData: any = {};
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  constructor(private cdr: ChangeDetectorRef, private service: CommonService,) {
  }

  ngOnInit() {
    this.getDashboardData();
    this.getAllUsersChart();
    this.loadRevenueData();
  }

  getDashboardData() {
    this.service.get('getDashboardData').subscribe((res: any) => {
      if (res.success) {
        this.dashboardData = res.data;
      }
    });
  }
  getAllUsersChart() {
    let formData = {
      year: this.selectedYear
    }
    this.service.postAPI('getAdminYearlyRevenue', formData).subscribe((res: any) => {
      if (res.success) {
        this.revenueChartData = [
          {
            name: 'Revenue (₹)',
            series: res.data.map((item: any) => {
              return {
                name: item.month,
                value: item.revenue
              }
            })
          }
        ];
      }
    });
  }

  // filterChart(period: 'day' | 'week' | 'month') {
  //   this.activeFilter = period;

  //   setTimeout(() => {
  //     let data: { name: string; value: number }[] = [];

  //     switch (period) {
  //       case 'day':
  //         data = [
  //           { name: 'Mon', value: 120 },
  //           { name: 'Tue', value: 150 },
  //           { name: 'Wed', value: 200 },
  //           { name: 'Thu', value: 250 },
  //           { name: 'Fri', value: 300 },
  //           { name: 'Sat', value: 280 },
  //           { name: 'Sun', value: 80 },
  //         ];
  //         break;

  //       case 'week':
  //         data = [
  //           { name: 'Week 1', value: 800 },
  //           { name: 'Week 2', value: 1200 },
  //           { name: 'Week 3', value: 950 },
  //           { name: 'Week 4', value: 1400 },
  //           { name: 'Week 5', value: 1300 },
  //         ];
  //         break;

  //       case 'month':
  //         data = [
  //           { name: 'Jan', value: 4000 },
  //           { name: 'Feb', value: 5000 },
  //           { name: 'Mar', value: 5500 },
  //           { name: 'Apr', value: 6000 },
  //           { name: 'May', value: 6500 },
  //           { name: 'Jun', value: 7000 },
  //           { name: 'Jul', value: 3000 },
  //           { name: 'Aug', value: 6500 },
  //           { name: 'Sep', value: 4000 },
  //           { name: 'Oct', value: 9000 },
  //         ];
  //         break;
  //     }

  //     this.userChartData = [
  //       {
  //         name: 'Users',
  //         series: data,
  //       },
  //     ];
  //   }, 150);
  // }


  loadRevenueData() {

    this.projectStatusData = [
      { name: 'Active', value: 35 },
      { name: 'Pending', value: 15 },
      { name: 'Completed', value: 50 }
    ];
  }
}
