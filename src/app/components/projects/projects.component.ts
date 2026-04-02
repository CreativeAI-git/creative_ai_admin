import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment.development';
import { debounce } from 'lodash';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {
  imageUrl = environment.imageUrl
  userId: any;
  url: string = ''
  showBillingModal: boolean = false;
  showCostingModal: boolean = false;
  showFeaturesModal: boolean = false;
  searchText: string = '';
  pagedData: any[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  pageSize = this.pageSizeOptions[0];
  isLoading: boolean = false;
  constructor(private service: CommonService) {

  }

  ngOnInit() {
    this.getData();
  }

  tableData: any;
  billingDetails: any = null;
  projectFeatures: any;

  getData() {
    this.url = `fetchProjectsByUser`
    const params: any = {
      page: this.currentPage.toString(),
      limit: this.pageSize.toString(),
    };

    if (this.searchText !== '') {
      params['search'] = this.searchText;
    }
    this.service.get<any[]>(this.url, params).subscribe((res: any) => {
      this.pagedData = res.data || [];
      this.totalRecords = res.totalRecords || 0;
      this.isLoading = false
    }, (err: any) => {
      this.isLoading = false;
      this.pagedData = [];
    });
  }

  costingData: any;

  onViewCosting(item: any) {
    this.showCostingModal = true;
    this.costingData = item;
  }

  expandedIndex: number | null = null;

  toggleDetails(index: number) {
    if (this.expandedIndex === index) {
      this.expandedIndex = null;
    } else {
      this.expandedIndex = index;
    }
  }

  checkRoute(route: string): string {
    if (!route) return '-';

    if (route.includes('make-it-mine')) {
      return 'Feature Selection Screen';
    }

    if (route.includes('ai-preview')) {
      return 'Ai Preview';
    }

    return '-';
  }

  parseData(data: any) {
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.pageSize = this.pageSize,
      // this.router.navigate([], {
      //   relativeTo: this.route,
      //   queryParams: {
      //     page: this.currentPage,
      //     pageSize: this.pageSize,
      //   },
      //   queryParamsHandling: 'merge',
      // });

      this.getData();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  onPageSizeChange(event: any) {
    const size = event.target.value;
    this.pageSize = +size;
    this.currentPage = 1;
    this.getData();
  }

  getPageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  search = debounce((event: any) => {
    this.searchText = event.target.value.trim();
    if (this.searchText.length > 0) {
      this.currentPage = 1
      this.getData();
    }
  }, 500);
}
