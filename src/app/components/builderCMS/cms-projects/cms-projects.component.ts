import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TableComponent } from '../../shared/table/table.component';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../services/common.service';
import { NoWhitespaceDirective } from '../../../validators';
import { SubmitButtonComponent } from "../../shared/submit-button/submit-button.component";
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-cms-projects',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, TableComponent, SubmitButtonComponent],
  templateUrl: './cms-projects.component.html',
  styleUrl: './cms-projects.component.css'
})
export class CmsProjectsComponent {
  imageUrl = environment.imageUrl
  Form!: FormGroup;
  loading: boolean = false
  columns: any[] = []
  url: string = ''
  showModal: boolean = false;
  showViewModal: boolean = false;
  projectData: any;
  LogoImage: File | null = null;
  logoPreview: string | null = null;
  projectId: number | null = null;
  previewProductImages: any[] = [];
  submitted: boolean = false
  showImagesModal: boolean = false
  productImages: File[] = [];
  constructor(private service: CommonService, private toastr: NzMessageService, private router: Router) {
    this.initForm()
  }

  ngOnInit(): void {
    this.getData()
  }

  initForm() {
    this.Form = new FormGroup({
      project_name: new FormControl('', [Validators.required, NoWhitespaceDirective.validate]),
      project_description: new FormControl('', [Validators.required, NoWhitespaceDirective.validate])
    })
  }

  getData() {
    this.url = 'fetchBuilderProjects'
    this.columns = [
      { field: '', header: 'S. No' },
      { field: 'projectName', header: 'Project Name' },
      { field: 'description', header: 'Description', addClass: 'w-[38rem] text-ellipsis overflow-hidden whitespace-nowrap' },
      { field: 'liveUrl', header: 'Live URL', isClickable: true },
      { field: 'action', header: 'Action', isEdit: true, isDelete: true, isView: true, isAlbum: true, isFeatures: true },
    ]
  }

  onSubmit() {
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
      return
    }


    this.loading = true
    let apiUrl = ''
    let formData = new FormData()

    if (this.projectId) {
      apiUrl = 'updateProjects'
      formData.append('projectId', this.projectId.toString())
      formData.append('projectName', this.Form.value.project_name.trim())
      formData.append('description', this.Form.value.project_description.trim())
      if (this.LogoImage) {
        formData.append('projectImage', this.LogoImage)
      }
    } else {
      apiUrl = 'insertOnboardProjects'
      formData.append('projectName', this.Form.value.project_name.trim())
      formData.append('description', this.Form.value.project_description.trim())
      if (this.LogoImage) {
        formData.append('projectImage', this.LogoImage)
      }
    }

    this.service.postAPI(apiUrl, formData).subscribe((res: any) => {
      if (res.success == true) {
        this.toastr.success(res.message)
        this.getData()
        this.onModalCloseHandler(false)
        this.Form.reset()
        this.LogoImage = this.logoPreview = null
        this.loading = false;
        this.projectId = null
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
    this.projectData = event
    this.showViewModal = true
  }

  onEdit(event: any) {
    this.showModal = true
    this.projectId = event.id
    this.logoPreview = event.projectImage
    this.Form.patchValue({
      project_name: event.projectName,
      project_description: event.description
    })
  }

  onDelete(event: any) {
    console.log(event);
  }

  openModal() {
    this.showModal = !this.showModal;
  }

  onModalCloseHandler(event: any) {
    this.showModal = event;
    this.showViewModal = event
    this.showImagesModal = event
  }

  onFeaturesView(event: any) {
    sessionStorage.setItem('currentRouteName', event.projectName)
    this.router.navigate([`/admin/builder-cms/project-details/${event.id}`])
  }

  onAlbumUpload(event: any) {
    this.service.get('getProjectTemplates', { id: event.id }).subscribe((res: any) => {
      this.previewProductImages = res.data;
      this.showImagesModal = true
      this.projectId = event.id
    })

  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.LogoImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeProjectImage() {
    this.logoPreview = null;
    this.LogoImage = null;
  }

  onProductImage(event: any) {
    const files = event.target.files;
    Array.from(files).forEach((file: any, i: any) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewProductImages.push({
          imageUrl: e.target.result,
          id: i + 1
        });
      };
      reader.readAsDataURL(file);
      this.productImages.push(file);
    });
  }

  removeProjectImages(index: number, item: any) {
    if (item.projectId) {
      this.loading = true
      this.service.get('deleteImageById', { id: item.id }).subscribe((res: any) => {
        if (res.success) {
          this.previewProductImages.splice(index, 1);
          this.loading = false
        } else {
          this.loading = false
        }
      })
    } else {
      this.previewProductImages.splice(index, 1);
      this.productImages.splice(index, 1);
    }

  }

  uploadProjectTemplateImages() {

    if (this.productImages.length == 0) {
      this.submitted = true
      return
    }

    this.loading = true
    let formData = new FormData()
    formData.append('projectId', this.projectId!.toString())
    for (let i = 0; i < this.productImages.length; i++) {
      formData.append('projectImage', this.productImages[i]);
    }

    this.service.postAPI('addProjectTemplateImages', formData).subscribe((res: any) => {
      if (res.success == true) {
        this.toastr.success(res.message)
        this.getData()
        this.onModalCloseHandler(false)
        this.loading = false
        this.productImages = []
        this.previewProductImages = []
        this.projectId = null
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
}
