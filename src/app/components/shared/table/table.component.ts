import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { debounce } from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  providers: [DatePipe, CurrencyPipe, NzModalService]
})
export class TableComponent {
  @Input() apiUrl!: string;
  @Input() isAddButton?: boolean = true;
  @Input() columns: {
    field: string;
    field2?: string;
    header: string;
    align?: string;
    width?: string;
    pipe?: string;
    isArray?: boolean;
    addClass?: string;
    arrayField?: string;
    isEdit?: boolean;
    isDelete?: boolean;
    isView?: boolean;
    isFeatures?: boolean;
    isAlbum?: boolean;
    combine?: boolean;
    sort?: boolean;
    color?: boolean;
  }[] = [];
  @Input() pageSizeOptions: number[] = [10, 20, 25];
  @Input() projectId?: any
  @Input() featureId?: any
  @Output() viewClicked = new EventEmitter<any>();
  @Output() editClicked = new EventEmitter<any>();
  @Output() deleteClicked = new EventEmitter<any>();
  @Output() featureViewClicked = new EventEmitter<any>();
  @Output() albumUploadClicked = new EventEmitter<any>();
  @Output() dataGetter = new EventEmitter<any>();

  pagedData: any[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = this.pageSizeOptions[0];
  isLoading: boolean = true;
  searchQuery: string = ''
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  constructor(private service: CommonService, private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe, private modal: NzModalService, private router: Router, private route: ActivatedRoute) { }

  // ngOnInit() {
  //   this.fetchData();
  // }

  ngOnChanges(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.pageSize = +params['pageSize'] || 10;
      this.fetchData();
    });
    // this.fetchData();
  }

  fetchData() {
    this.isLoading = true
    const params: any = {
      page: this.currentPage.toString(),
      limit: this.pageSize.toString(),
    };

    if (this.searchQuery !== '') {
      params['search'] = this.searchQuery;
    }

    if (this.projectId) {
      params['projectId'] = this.projectId;
    }
    if (this.featureId) {
      params['featureId'] = this.featureId;
    }

    this.service.get<any[]>(this.apiUrl, params).subscribe((res: any) => {

      this.pagedData = res.data || [];
      this.dataGetter.emit(this.pagedData)
      this.totalRecords = res.totalRecords || 0;
      this.isLoading = false
    }, (err: any) => {
      this.isLoading = false;
      this.pagedData = [];
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize,
      },
      queryParamsHandling: 'merge',
    });

    this.fetchData();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  onPageSizeChange(event: any) {
    const size = event.target.value;
    this.pageSize = +size;
    this.currentPage = 1;
    this.fetchData();
  }

  getPageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  emitView(row: any) {
    this.viewClicked.emit(row);
  }
  emitEdit(row: any) {
    this.editClicked.emit(row);
  }
  emitDelete(row: any) {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this item?',
      nzContent: '<p style="color: red;"> This action cannot be undone.</p>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteClicked.emit(row),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  emitFeaturesView(row: any) {
    this.featureViewClicked.emit(row);
  }

  emitAlbumUpload(row: any) {
    this.albumUploadClicked.emit(row);
  }

  applyPipe(value: any, pipeName: string, args: string = ''): any {
    switch (pipeName) {
      case 'date':
        return this.datePipe.transform(value, args || 'mediumDate');
      case 'currency':
        return this.currencyPipe.transform(value, args || 'INR');
      default:
        return value;
    }
  }

  parseData(array: any[], key: string): string {
    if (!Array.isArray(array) || !key) return 'N/A';
    const values = array.map(item => item?.[key]).filter(Boolean);
    return values.length ? values.join(' | ') : 'N/A';
  }

  search = debounce((event: any) => {
    this.searchQuery = event.target.value.trim();
    if (this.searchQuery.length > 0) {
      this.currentPage = 1
      this.fetchData();

    }

    // this.fetchData();
  }, 500);


  sort(col: any) {
    if (!col.field || col.field === 'action') return;

    if (this.sortField === col.field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = col.field;
      this.sortDirection = 'asc';
    }

    this.applySorting();
  }

  applySorting() {

    const direction = this.sortDirection === 'asc' ? 1 : -1;

    this.pagedData.sort((a: any, b: any) => {

      const valueA = a[this.sortField];
      const valueB = b[this.sortField];

      if (valueA == null) return -1 * direction;
      if (valueB == null) return 1 * direction;

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (valueA - valueB) * direction;
      }

      return valueA.toString().localeCompare(valueB.toString()) * direction;
    });

    // this.updatePagedData();
  }

  updatePagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.pagedData = this.pagedData.slice(start, end);
  }
}
