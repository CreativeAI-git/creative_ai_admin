import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounce } from 'lodash';
import { CommonService } from '../../../services/common.service';

interface SubscriptionRow {
  user_subscription_row_id: number;
  user_id: number;
  user_name: string | null;
  user_email: string | null;
  subscription_id: string;
  plan_key: string;
  user_plan_type: string;
  subscription_status: string;
  start_date: string | null;
  next_charge_date: string | null;
  is_intro: number;
  subscription_created_at: string | null;
  subscription_updated_at: string | null;
  plan_name: string;
  subscription_plan_type: string;
  plan_amount: number;
  plan_display_amount: string | null;
  plan_currency: string | null;
  billing_interval: string | null;
  discount_percent: number;
  intro_amount: string | null;
  payment_row_id: number | null;
  cycle_number: number | null;
  payment_amount: string | null;
  payment_currency: string | null;
  payment_status: string | null;
  gateway_payment_id: string | null;
  cf_payment_id: string | null;
  cf_txn_id: string | null;
  cf_subscription_id: string | null;
  payment_method: string | null;
  upi_id: string | null;
  card_network: string | null;
  card_country: string | null;
  card_bank_name: string | null;
  card_number: string | null;
  payment_created_at: string | null;
  transaction_id: string | null;
}

interface SubscriptionListResponse {
  data: SubscriptionRow[];
  totalRecords: number;
  total?: number;
}

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-list.component.html',
  styleUrl: './subscription-list.component.css'
})
export class SubscriptionListComponent {
  readonly statusOptions = ['ACTIVE', 'PENDING', 'CANCELLED', 'INACTIVE', 'EXPIRED'];
  searchText = '';
  statusFilter = '';
  planKeyFilter = '';
  userIdFilter = '';
  pagedData: SubscriptionRow[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSizeOptions: number[] = [10, 20, 50, 100];
  pageSize = this.pageSizeOptions[0];
  isLoading = false;
  errorMessage = '';

  constructor(private service: CommonService) {

  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage.toString(),
      limit: this.pageSize.toString(),
    };

    if (this.searchText !== '') {
      params['search'] = this.searchText;
    }

    if (this.statusFilter !== '') {
      params['status'] = this.statusFilter;
    }

    if (this.planKeyFilter !== '') {
      params['plan_key'] = this.planKeyFilter.trim();
    }

    if (this.userIdFilter !== '') {
      params['user_id'] = this.userIdFilter.trim();
    }

    this.service.get<SubscriptionListResponse>('fetchAllUserSubscriptions', params).subscribe((res) => {
      this.pagedData = res.data || [];
      this.totalRecords = res.totalRecords || res.total || 0;
      this.isLoading = false;
    }, (err: Error) => {
      this.isLoading = false;
      this.pagedData = [];
      this.totalRecords = 0;
      this.errorMessage = err?.message || 'Unable to load subscriptions.';
    });
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.getTotalPages() || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.getData();
  }

  getTotalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
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

  applyFilters() {
    this.currentPage = 1;
    this.getData();
  }

  clearFilters() {
    this.searchText = '';
    this.statusFilter = '';
    this.planKeyFilter = '';
    this.userIdFilter = '';
    this.currentPage = 1;
    this.getData();
  }

  search = debounce((event: any) => {
    this.searchText = event.target.value.trim();
    this.currentPage = 1;
    this.getData();
  }, 500);

  getUserName(item: SubscriptionRow): string {
    return item.user_name || '-';
  }

  getUserEmail(item: SubscriptionRow): string {
    return item.user_email || '-';
  }

  getPlanName(item: SubscriptionRow): string {
    return item.plan_name || '-';
  }

  getPlanKeyLabel(item: SubscriptionRow): string {
    return item.plan_key ? item.plan_key.replace(/_/g, ' ') : '-';
  }

  getAmount(item: SubscriptionRow): number | null {
    const amount = item.plan_display_amount ?? item.plan_amount;
    return amount === null || amount === undefined || amount === '' ? null : Number(amount);
  }

  getStatus(item: SubscriptionRow): string {
    return item.subscription_status || 'UNKNOWN';
  }

  getStartDate(item: SubscriptionRow): string | null {
    return item.start_date;
  }

  getNextChargeDate(item: SubscriptionRow): string | null {
    return item.next_charge_date;
  }

  getCreatedAt(item: SubscriptionRow): string | null {
    return item.subscription_created_at;
  }

  getPaymentAmount(item: SubscriptionRow): number | null {
    return item.payment_amount ? Number(item.payment_amount) : null;
  }

  getPaymentStatus(item: SubscriptionRow): string {
    return item.payment_status || 'Unpaid';
  }

  getPaymentMethod(item: SubscriptionRow): string {
    return item.payment_method ? item.payment_method.toUpperCase() : '-';
  }

  hasIntroOffer(item: SubscriptionRow): boolean {
    return item.is_intro === 1;
  }

  getStatusClass(status: string): string {
    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === 'ACTIVE') {
      return 'status-active';
    }

    if (normalizedStatus === 'CANCELLED' || normalizedStatus === 'EXPIRED' || normalizedStatus === 'FAILED' || normalizedStatus === 'INACTIVE') {
      return 'status-inactive';
    }

    return 'status-pending';
  }

  getPaymentStatusClass(status: string): string {
    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === 'SUCCESS' || normalizedStatus === 'PAID' || normalizedStatus === 'CAPTURED' || normalizedStatus === 'AUTH') {
      return 'payment-success';
    }

    if (normalizedStatus === 'FAILED' || normalizedStatus === 'CANCELLED') {
      return 'payment-failed';
    }

    return 'payment-pending';
  }
}
