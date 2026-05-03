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

  formatDate(value: string | null | undefined): string {
    if (!value) return 'N/A';
    return value.replace(' ', 'T').split('.')[0];
  }
}
