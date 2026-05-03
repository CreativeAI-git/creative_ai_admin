import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-client-project-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-project-details.component.html',
  styleUrl: './client-project-details.component.css'
})
export class ClientProjectDetailsComponent {
  projectId: any;
  projectData: any;
  templateHistory: any[] = [];
  isLoading: boolean = false;
  expandedErrorReports: Record<string, boolean> = {};

  constructor(private route: ActivatedRoute, private service: CommonService, public location: Location) {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id');
    });
  }

  ngOnInit(): void {
    if (this.projectId) {
      this.isLoading = true;
      this.service.get('fetchTemplateByInquieryId', { inquieryId: this.projectId }).subscribe((res: any) => {
        this.projectData = res.data;
        this.templateHistory = [...(this.projectData?.templates || [])].sort((a: any, b: any) =>
          new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
        );
        this.isLoading = false;
      }, () => {
        this.isLoading = false;
      })
    }
  }

  getDisplayValue(value: any): string {
    return value === null || value === undefined || value === '' ? 'N/A' : String(value);
  }

  getStatusText(status: any): string {
    return String(status) === '0' ? 'Draft' : 'Completed';
  }

  getProjectStatusClasses(status: any): string {
    return String(status) === '0'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-emerald-100 text-emerald-700';
  }

  getBuildStatusText(status: any): string {
    if (status === 1 || String(status) === '1') return 'Build Ready';
    if (status === 0 || String(status) === '0') return 'Build Failed';
    return 'Building in Progress';
  }

  getBuildStatusClasses(status: any): string {
    if (status === 1 || String(status) === '1') return 'text-emerald-700';
    if (status === 0 || String(status) === '0') return 'text-red-700';
    return 'text-red-700';
  }

  getDeploymentText(status: any): string {
    return status === 1 || String(status) === '1' ? 'Deployed' : 'Not Deployed';
  }

  getDeploymentClasses(status: any): string {
    return status === 1 || String(status) === '1'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-600';
  }

  getSuccessfulBuildCount(): number {
    return this.templateHistory.filter(template => template?.build_status === 1 || String(template?.build_status) === '1').length;
  }

  hasErrorReports(template: any): boolean {
    return Array.isArray(template?.error_reports) && template.error_reports.length > 0;
  }

  getLatestErrorReport(template: any): any | null {
    if (!this.hasErrorReports(template)) {
      return null;
    }

    return this.getSortedErrorReports(template)[0];
  }

  getSortedErrorReports(template: any): any[] {
    if (!this.hasErrorReports(template)) {
      return [];
    }

    return [...template.error_reports].sort((a: any, b: any) =>
      new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
    );
  }

  getErrorPreview(errorMessage: string | null | undefined): string {
    if (!errorMessage) {
      return 'No error details available.';
    }

    return errorMessage.length > 320 ? `${errorMessage.slice(0, 320)}...` : errorMessage;
  }

  getTemplateKey(template: any): string {
    return String(template?.public_template_id || `${template?.variation_no || 'na'}-${template?.created_at || 'na'}`);
  }

  hasMoreErrorReports(template: any): boolean {
    return this.getSortedErrorReports(template).length > 1;
  }

  isErrorReportsExpanded(template: any): boolean {
    return !!this.expandedErrorReports[this.getTemplateKey(template)];
  }

  toggleErrorReports(template: any): void {
    const templateKey = this.getTemplateKey(template);
    this.expandedErrorReports[templateKey] = !this.expandedErrorReports[templateKey];
  }

  getRemainingErrorReports(template: any): any[] {
    return this.getSortedErrorReports(template).slice(1);
  }

  getErrorToggleLabel(template: any): string {
    const remainingCount = this.getRemainingErrorReports(template).length;

    if (this.isErrorReportsExpanded(template)) {
      return 'View Less';
    }

    return `View More (${remainingCount})`;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'N/A';
    return value.replace(' ', 'T').split('.')[0];
  }
}
