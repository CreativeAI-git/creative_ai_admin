import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarCollapseDirective } from './sidebar-collapse.directive';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [SidebarCollapseDirective, RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None
})

export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  sidebarIsCollapsed: boolean = true;
  private routerSubscription: Subscription = new Subscription();

  @Output() sidebarCollapsed = new EventEmitter<boolean>();

  constructor(
    private readonly elementRef: ElementRef,
    private router: Router) { }

  ngOnInit(): void {
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Call the subMenuToggleHandlerOnRouteChange function immediately after
   * the component and its children have been initialized, and call the
   * subMenuToggleHandlerOnPageReload function 1ms after the page has finished
   * loading.
   */
  /*******  aed1cfec-8874-47a0-a126-df92972dbdb4  *******/
  ngAfterViewInit(): void {
    this.subMenuToggleHandlerOnRouteChange();
    setTimeout(() => { this.subMenuToggleHandlerOnPageReload() }, 1);
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  subMenuToggleHandler = (event: MouseEvent): void => {
    const elem = event.target as HTMLElement;
    const subMenu = elem?.closest("a.sub-menu") as Element;

    if (subMenu.getAttribute('aria-expanded') == 'false')
      subMenu.setAttribute('aria-expanded', 'true');
    else
      subMenu.setAttribute('aria-expanded', 'false');
  }

  subMenuToggleHandlerOnPageReload = (): void => {
    const elem = this.elementRef.nativeElement.querySelector('[aria-current="page"]')
      .closest('ul.sub-menu-item') as Element;

    const subMenu = elem?.previousSibling as Element;

    subMenu?.setAttribute('aria-expanded', 'true');
  }

  subMenuToggleHandlerOnRouteChange = (): void => {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const subMenu = this.elementRef.nativeElement.querySelectorAll(".sub-menu");
        const elem = this.elementRef.nativeElement.querySelector(`[href='${event.url}']`) as Element;

        if (elem?.closest('ul.sub-menu-item')) return;

        subMenu.forEach((subMenu: Element) => {
          if (subMenu.getAttribute('aria-expanded') == 'true')
            subMenu.setAttribute('aria-expanded', 'false');
        });
      }
    })
  }
}
