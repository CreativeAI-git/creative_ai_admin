import { Component } from '@angular/core';
import { TableComponent } from "../shared/table/table.component";
import { CommonService } from '../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-user-projects',
  standalone: true,
  imports: [TableComponent, CommonModule],
  templateUrl: './user-projects.component.html',
  styleUrl: './user-projects.component.css'
})
export class UserProjectsComponent {
  url: string = ''
  loading: boolean = false
  columns: any[] = [];
  totalLength: any;
  showViewModal: boolean = false
  userData: any
  imgUrl: string = environment.imageUrl
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
      { field: 'total_projects', header: 'Projects', sort: true, },
      { field: 'createdAt', pipe: 'date', header: 'Registration Date', combine: true },
      { field: 'action', header: 'Action', isView: true, isFeatures: true },
    ]
  }

  onView(event: any) {
    this.userData = event
    this.showViewModal = true
  }

  getResponse(event: any) {
    this.totalLength = event.length
  }

  onFeaturesView(event: any) {
    this.router.navigate(['/admin/project-list'], { queryParams: { id: event.id } });
  }

  getInitials(name: string): string {
    if (!name) return '';

    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
