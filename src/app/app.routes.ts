import { Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
      {
            path: '',
            loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
            pathMatch: 'full'
      },
      {
            path: 'forgot-password',
            loadComponent: () => import('./components/auth/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent),
      },
      {
            path: 'admin',
            loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
            // canActivate: [RoleGuard],
            children: [
                  {
                        path: 'dashboard',
                        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
                        canActivate: [RoleGuard],
                        pathMatch: 'full'
                  },
                  {
                        path: 'teams',
                        loadComponent: () => import('./components/teams/teams.component').then(m => m.TeamsComponent),
                        canActivate: [RoleGuard],
                  },
                  {
                        path: 'project-enquiries',
                        loadComponent: () => import('./components/projectt-enquries/projectt-enquries.component').then(m => m.ProjecttEnquriesComponent),
                        canActivate: [RoleGuard],
                  },
                  {
                        path: 'projects',
                        loadComponent: () => import('./components/projects/projects.component').then(m => m.ProjectsComponent),
                        canActivate: [RoleGuard],
                  },
                  {
                        path: 'project-details/:id',
                        loadComponent: () => import('./components/projects/client-project-details/client-project-details.component').then(m => m.ClientProjectDetailsComponent),
                        // canActivate: [RoleGuard],
                  },
                  {
                        path: 'user_buider_projects',
                        loadComponent: () => import('./components/user-projects/user-projects.component').then(m => m.UserProjectsComponent),
                        canActivate: [RoleGuard],
                  },
                  {
                        path: 'project-list',
                        loadComponent: () => import('./components/user-projects/project-list/project-list.component').then(m => m.ProjectListComponent),
                        // canActivate: [RoleGuard],
                  },
                  {
                        path: 'builder-cms/projects',
                        loadComponent: () => import('./components/builderCMS/cms-projects/cms-projects.component').then(m => m.CmsProjectsComponent),
                        // canActivate: [RoleGuard],
                  },
                  {
                        path: 'builder-cms/Features',
                        loadComponent: () => import('./components/builderCMS/cms-features/cms-features.component').then(m => m.CmsFeaturesComponent),
                        // canActivate: [RoleGuard],
                  },
                  {
                        path: 'builder-cms/feature-detail/:id',
                        loadComponent: () => import('./components/builderCMS/cms-features/cms-feature-detail/cms-feature-detail.component').then(m => m.CmsFeatureDetailComponent),
                        // canActivate: [RoleGuard],
                  },
                  {
                        path: 'blog-management',
                        loadComponent: () => import('./components/blog-management/blogs-list/blogs-list.component').then(m => m.BlogsListComponent),
                        // canActivate: [RoleGuard],
                  },
                  {
                        path: 'add-blog',
                        loadComponent: () => import('./components/blog-management/add-blog/add-blog.component').then(m => m.AddBlogComponent),
                        // canActivate: [RoleGuard],
                  },
                  {
                        path: 'builder-cms/project-details/:id',
                        loadComponent: () => import('./components/builderCMS/cms-projects/cms-project-details/cms-project-details.component').then(m => m.CmsProjectDetailsComponent),
                        // canActivate: [RoleGuard],
                  },
                  {
                        path: 'subscriptions',
                        loadComponent: () => import('./components/subscriptions/subscription-list/subscription-list.component').then(m => m.SubscriptionListComponent),
                        // canActivate: [RoleGuard],
                  },
                  {
                        path: 'subscriptions/:id',
                        loadComponent: () => import('./components/subscriptions/subscription-detail/subscription-detail.component').then(m => m.SubscriptionDetailComponent),
                        // canActivate: [RoleGuard],
                  }
            ]
      }

];
