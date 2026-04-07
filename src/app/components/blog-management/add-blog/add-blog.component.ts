import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../services/common.service';
import { NoWhitespaceDirective } from '../../../validators';
import { CommonModule, Location } from '@angular/common';
import { SubmitButtonComponent } from '../../shared/submit-button/submit-button.component';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-add-blog',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, SubmitButtonComponent, NgxEditorModule, RouterLink],
  templateUrl: './add-blog.component.html',
  styleUrl: './add-blog.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AddBlogComponent {
  Form!: FormGroup;
  LogoImage: File | null = null;
  loading: boolean = false;
  blogId: any | null = null;
  logoPreview: string | null = null;
  editor1!: Editor;
  about_us: any = '';
  submited: boolean = false
  imageUrl: any = environment.imageUrl;
  constructor(private service: CommonService, private toastr: NzMessageService, private router: Router, public location: Location, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.blogId = this.route.snapshot.queryParamMap.get('id');
    this.initForm();
    if (this.blogId) {
      this.geSingleBlog();
    }
  }

  initForm() {
    this.editor1 = new Editor();
    this.Form = new FormGroup({
      title: new FormControl('', [Validators.required, NoWhitespaceDirective.validate]),
      slug: new FormControl('', [Validators.required, NoWhitespaceDirective.validate]),
      description: new FormControl('', [Validators.required, NoWhitespaceDirective.validate]),
      post_date: new FormControl('', [Validators.required, NoWhitespaceDirective.validate]),
      text_editor: new FormControl('', [Validators.required, NoWhitespaceDirective.validate]),
      // img: new FormControl(null, [Validators.required]),
    })
  }

  toolbar1: Toolbar = [
    // default value
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    // ['link', 'image'],
    // or, set options for link:
    [{ link: { showOpenInNewTab: false } }, 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear', 'indent', 'outdent'],
    ['superscript', 'subscript'],
    ['undo', 'redo'],
  ];

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

  onSubmit() {
    if (this.Form.invalid || !this.logoPreview) {
      this.submited = true;
      this.Form.markAllAsTouched();
      return
    }


    this.loading = true
    let apiUrl = ''
    let formData = new FormData()

    if (this.blogId) {
      const htmlContentAbout = `${this.Form.value.text_editor.trim()}`;
      apiUrl = 'updateBlogsCMS'
      formData.append('id', this.blogId.toString())
      formData.append('text_editor', htmlContentAbout);
      formData.append('title', this.Form.value.title.trim())
      formData.append('slug', this.Form.value.slug.trim())
      formData.append('description', this.Form.value.description.trim())
      formData.append('post_date', this.Form.value.post_date)
      if (this.LogoImage) {
        formData.append('blog_image', this.LogoImage)
      }
    } else {
      const htmlContentAbout = `${this.Form.value.text_editor.trim()}`;
      apiUrl = 'addBlogsCMS'
      formData.append('text_editor', htmlContentAbout)
      formData.append('title', this.Form.value.title.trim())
      formData.append('slug', this.Form.value.slug.trim())
      formData.append('description', this.Form.value.description.trim())
      formData.append('post_date', this.Form.value.post_date)
      if (this.LogoImage) {
        formData.append('blog_image', this.LogoImage)
      }
    }

    this.service.postAPI(apiUrl, formData).subscribe((res: any) => {
      if (res.success == true) {
        this.toastr.success(res.message)

        this.router.navigateByUrl('/admin/blog-management')

        this.LogoImage = this.logoPreview = null
        this.loading = false;
        this.blogId = null
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

  geSingleBlog() {
    this.service.get(`getBlogById?id=${this.blogId}`).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.Form.patchValue({
            title: resp.data[0].title,
            slug: resp.data[0].slug || '',
            post_date: resp.data[0].post_date,
            text_editor: resp.data[0].text_editor,
            description: resp.data[0].description,
          });
          this.logoPreview = this.imageUrl + resp.data[0].banner_image;
        } else {
          this.toastr.warning(resp.message);
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


}
