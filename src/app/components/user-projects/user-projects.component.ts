import { Component } from '@angular/core';
import { TableComponent } from "../shared/table/table.component";
import { CommonService } from '../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-projects',
  standalone: true,
  imports: [TableComponent, RouterLink],
  templateUrl: './user-projects.component.html',
  styleUrl: './user-projects.component.css'
})
export class UserProjectsComponent {
  url: string = ''
  loading: boolean = false
  columns: any[] = [];
  totalLength: any;

  constructor(private service: CommonService, private toastr: NzMessageService, private router: Router) {
  }

  ngOnInit(): void {
    this.getData()
  }

  getData() {
    this.url = 'fetchAllUsersByAdmin'
    this.columns = [
      { field: '', header: 'S. No' },
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email', },
      { field: 'country_code', field2: 'phoneNumber', header: 'Phone No.', combine: true },
      { field: 'is_project_created', header: 'Is Project Created', color:true },
      { field: 'active_plan', header: 'Active Plan'},
      { field: 'createdAt', pipe: 'date', header: 'Registered on', combine: true },
      { field: 'action', header: 'Action', isView: true, isFeatures: true },
    ]
  }

  onView(event: any) {
    // this.projectData = event
    // this.showViewModal = true
  }

  getResponse(event: any) {
    this.totalLength = event.length
  }

  onFeaturesView(event: any) {
    this.router.navigate(['/admin/project-list'], { queryParams: { id: event.id } });
  }


}
