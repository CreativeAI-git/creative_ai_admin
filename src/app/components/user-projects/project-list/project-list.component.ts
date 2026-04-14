import { Component } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubmitButtonComponent } from '../../shared/submit-button/submit-button.component';
import { NgxEditorModule } from 'ngx-editor';
import { TableComponent } from '../../shared/table/table.component';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, NgxEditorModule, FormsModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent {

  imageUrl = environment.imageUrl
  userId: any;
  columns: any[] = []
  url: string = ''
  showBillingModal: boolean = false;
  showCostingModal: boolean = false;
  showFeaturesModal: boolean = false;
  searchText: string = '';
  filteredData: any[] = [];

  constructor(private service: CommonService, private toastr: NzMessageService, private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.userId = this.route.snapshot.queryParamMap.get('id');
    //this.geSingleBlog();
    this.getData();
  }

  tableData: any;
  billingDetails: any = null;
  projectFeatures: any;

  getData() {
    this.url = `getProjectsByUserId?id=${this.userId}`
    // this.columns = [
    //   { field: '', header: 'S. No' },
    //   { field: 'clientProjectName', header: 'Project Name' },
    //   { field: 'no_of_features', header: 'no_of_features' },
    //   { field: 'durations', header: 'Durations' },
    //   { field: 'features_cost', header: 'Features Cost' },
    //   { field: 'total_cost_delivery', header: 'Total Cost Delivery' },
    //   { field: 'platforms', header: 'Platforms', isArray: true },
    //   { field: 'development_speed', header: 'Development Speed' },
    //   { field: 'client_currency_code', header: 'Country Code' },
    //   { field: 'createdAt', header: 'Created At', pipe: 'date' },


    //   { field: 'currentRoutes', header: 'currentRoutes' },
    //   { field: 'billing_details', header: 'billing_details' },
    //   { field: 'phases_deliverables', header: 'phases_deliverables' },
    //   { field: 'projectFeatures', header: 'projectFeatures' },
    //   { field: 'action', header: 'Action', isEdit: false, isDelete: false, isView: false, isAlbum: false, isFeatures: false },
    // ]
    this.service.get(this.url).subscribe((resp: any) => {
      this.tableData = resp.data.map((project: any) => {
        try {
          project.platforms = JSON.parse(project.platforms).join(', ');
        } catch {
          project.platforms = project.platforms;
        }
        return project;
      });
      this.filterTable();
    });
  }

  filterTable() {
    let filtered = this.tableData;
    // Filter by customer name
    if (this.searchText.trim()) {
      const keyword = this.searchText.trim().toLowerCase();
      filtered = filtered.filter((item: any) =>
        (item.clientProjectName?.toLowerCase().includes(keyword))
      );
    }
    this.filteredData = filtered;
  }

  onViewBilling(billingDetails: any) {
    this.showBillingModal = true;

    try {
      // If it's a stringified JSON, parse it
      this.billingDetails = typeof billingDetails === 'string'
        ? JSON.parse(billingDetails)
        : billingDetails;
    } catch {
      // If parsing fails, just use as-is
      this.billingDetails = billingDetails;
    }

    // If it's an array, pick the first one (based on your API structure)
    if (Array.isArray(this.billingDetails)) {
      this.billingDetails = this.billingDetails[0];
    }

    console.log('Billing details to show in modal:', this.billingDetails);
  }


  onViewFeatures(projectFeatures: any) {
    this.showFeaturesModal = true; // open features modal

    try {
      // Parse if it's a stringified JSON
      this.projectFeatures = typeof projectFeatures === 'string'
        ? JSON.parse(projectFeatures)
        : projectFeatures;
    } catch {
      // Fallback if parsing fails
      this.projectFeatures = projectFeatures;
    }

    console.log('Project features to show in modal:', this.projectFeatures);
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

  getDisplayValue(value: any): string {
    return value === null || value === undefined || value === '' ? 'N/A' : String(value);
  }
}
