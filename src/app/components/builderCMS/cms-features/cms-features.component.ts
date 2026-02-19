import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../services/common.service';
import { NoWhitespaceDirective } from '../../../validators';
import { TableComponent } from '../../shared/table/table.component';
import { SubmitButtonComponent } from '../../shared/submit-button/submit-button.component';
@Component({
  selector: 'app-cms-features',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, TableComponent, SubmitButtonComponent],
  templateUrl: './cms-features.component.html',
  styleUrl: './cms-features.component.css'
})
export class CmsFeaturesComponent {
  Form!: FormGroup;
  loading: boolean = false
  columns: any[] = []
  url: string = ''
  featureId: number | null = null
  constructor(private service: CommonService, private toastr: NzMessageService, private router: Router, public location: Location) {
    this.initForm()
  }

  ngOnInit(): void {
    this.getData()
  }

  initForm() {
    this.Form = new FormGroup({
      featureName: new FormControl('', [Validators.required, NoWhitespaceDirective.validate]),
    })
  }

  getData() {
    this.url = 'getAllFeatures'
    this.columns = [
      { field: '', header: 'S. No' },
      { field: 'featuresName', header: 'Features' },
      { field: 'subFeatures', header: 'Sub-Features', isArray: true, arrayField: 'subFeaturesName' },
      { field: 'action', header: 'Action', isEdit: true, isDelete: true, isView: true },
    ]
  }

  onSubmit() {
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
      return
    }
    this.loading = true

    let formData = {}
    let apiUrl = ''
    if (this.featureId) {
      apiUrl = 'updateFeatures'
      formData = {
        id: this.featureId,
        featureName: this.Form.value.featureName.trim(),
      }
    } else {
      apiUrl = 'addFeature'
      formData = {
        featureName: this.Form.value.featureName.trim(),
      }
    }

    this.service.postAPI(apiUrl, formData).subscribe((res: any) => {
      if (res.success == true) {
        this.toastr.success(res.message)
        this.getData()
        this.onModalCloseHandler(false)
        this.loading = false
      } else {
        this.toastr.warning(res.message)
        this.loading = false
      }
    },
      (err: any) => {
        this.toastr.error(err)
        this.loading = false
      })
  }

  onView(event: any) {
    sessionStorage.setItem('currentRouteName', event.featuresName)
    this.router.navigate([`/admin/builder-cms/feature-detail/${event.id}`])
  }

  onEdit(event: any) {
    this.featureId = event.id
    this.showModal = true
    this.Form.patchValue({
      featureName: event.featuresName,
    })
  }

  onDelete(event: any) {
    this.service.get('deleteFeatures', { id: event.id }).subscribe((res: any) => {
      if (res.success == true) {
        this.toastr.success(res.message)
        this.getData()
      } else {
        this.toastr.warning(res.message)
      }
    })
  }

  showModal: boolean = false;
  openModal() {
    this.showModal = !this.showModal;
  }

  onModalCloseHandler(event: any) {
    this.showModal = event;
    this.featureId = null
    this.Form.reset()
  }
}
