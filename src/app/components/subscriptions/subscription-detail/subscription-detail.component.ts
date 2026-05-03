import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

interface SubscriptionDetailResponse {
  success: boolean;
  status: number;
  message: string;
  data: SubscriptionRow | null;
}

@Component({
  selector: 'app-subscription-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-detail.component.html',
  styleUrl: './subscription-detail.component.css'
})
export class SubscriptionDetailComponent {
  subscriptionRowId: number | null = null;
  subscriptionData: SubscriptionRow | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private service: CommonService,
    public location: Location
  ) {
    this.route.paramMap.subscribe(params => {
      this.subscriptionRowId = Number(params.get('id'));
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    if (!this.subscriptionRowId) {
      this.errorMessage = 'Subscription details could not be loaded.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const params = {
      id: String(this.subscriptionRowId)
    };

    this.service.get<SubscriptionDetailResponse>('fetchUserSubscriptionDetailById', params).subscribe((res) => {
      this.subscriptionData = res?.data || null;
      this.isLoading = false;

      if (!this.subscriptionData) {
        this.errorMessage = res?.message || 'Subscription details could not be loaded.';
      }
    }, (err: Error) => {
      this.isLoading = false;
      this.errorMessage = err?.message || 'Subscription details could not be loaded.';
    });
  }

  getDisplayValue(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === '' ? 'N/A' : String(value);
  }

  getAmount(value: string | number | null | undefined): number | null {
    return value === null || value === undefined || value === '' ? null : Number(value);
  }

  getStatusClass(status: string | null | undefined): string {
    const normalizedStatus = String(status || '').toUpperCase();

    if (normalizedStatus === 'ACTIVE') {
      return 'status-active';
    }

    if (normalizedStatus === 'CANCELLED' || normalizedStatus === 'EXPIRED' || normalizedStatus === 'FAILED' || normalizedStatus === 'INACTIVE') {
      return 'status-inactive';
    }

    return 'status-pending';
  }

  getPlanAmount(): number | null {
    return this.getAmount(this.subscriptionData?.plan_display_amount || this.subscriptionData?.plan_amount);
  }

  getPaymentAmountValue(): number | null {
    return this.getAmount(this.subscriptionData?.payment_amount);
  }

  getPlanMeta(): string {
    if (!this.subscriptionData) {
      return 'N/A';
    }

    return `${this.getDisplayValue(this.subscriptionData.subscription_plan_type)} • ${this.getDisplayValue(this.subscriptionData.billing_interval) === 'MONTH' ? 'Monthly' : 'Yearly'}`;
  }

  getPaymentMeta(): string {
    if (!this.subscriptionData) {
      return 'N/A';
    }

    return `${this.getDisplayValue(this.subscriptionData.payment_method).toUpperCase()} • ${this.getDisplayValue(this.subscriptionData.payment_currency)} `;
  }

  getCustomerInitials(): string {
    const name = this.subscriptionData?.user_name?.trim();
    if (!name) {
      return 'NA';
    }

    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map(part => part.charAt(0).toUpperCase()).join('');
  }
}
