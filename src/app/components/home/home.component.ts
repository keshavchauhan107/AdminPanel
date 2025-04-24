import { AfterViewInit, Component, ElementRef, inject, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// interface MenuModel {
//   menuName: string;
//   menuURL: string;
// }
// interface ModuleModel {
//   moduleName: string;
//   menus: MenuModel[];
// }

@Component({
  selector: 'app-home',
  imports: [RouterOutlet,RouterLink,NgFor,NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  @ViewChild('navMenu', { static: true }) navMenu!: ElementRef;
  private listeners: (() => void)[] = [];
  user:any;
  res:any;
  module:any;
  // Configuration options
  private accordion: boolean = true;
  private speed: number = 400;        // Not used here for animation timing, but left for reference.
  private closedSign: string = '+';
  private openedSign: string = '-';
  private initClass: string = 'js-nav-built';
  constructor(private renderer: Renderer2,private authService: AuthService,private router:Router) {}
  http=inject(HttpClient)
  ngOnInit(){
    this.user=this.authService.getUser();
    const token = localStorage.getItem('token');
    const user=JSON.parse(localStorage.getItem('user') || '{}');
    const userID=user.userID || 0;
    
    // console.log(token);
    this.http.get<{ message: string }>(`https://localhost:7218/api/Auth/${userID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe((res: any) => {
      if (res.message === 'success') {
        // process response
        this.module=res.modules;
        setTimeout(() => this.buildMenu(), 0);
        console.log(this.module);
        console.log(res);
      } else {
        console.log(res.message);
      }
    });
    // this.module=JSON.parse(localStorage.getItem('res') || '{}');
    // this.module=this.module.modules
  }

  private buildMenu() {
    const nav: HTMLElement = this.navMenu.nativeElement;

    // Prevent re-initialization if already built.
    if (!nav.classList.contains(this.initClass)) {
      this.renderer.addClass(nav, this.initClass);

      // Process every <li> in the navigation
      const liElements = nav.querySelectorAll('li') as NodeListOf<HTMLElement>;
      liElements.forEach((li: HTMLElement) => {
        const submenu = li.querySelector('ul');
        if (submenu) {
          const anchor = li.querySelector('a');
          if (anchor) {
            // Append a <b> element with the collapse sign
            const collapseSign = this.renderer.createElement('b');
            this.renderer.addClass(collapseSign, 'collapse-sign');
            const text = this.renderer.createText(this.closedSign);
            this.renderer.appendChild(collapseSign, text);
            this.renderer.appendChild(anchor, collapseSign);

            // Prevent default if href is '#' to avoid page jump.
            if (anchor.getAttribute('href') === '#') {
              const clickListener = this.renderer.listen(anchor, 'click', (event: Event) => {
                event.preventDefault();
              });
              this.listeners.push(clickListener);
            }
          }
        }
      });

      // If any <li> is pre-marked as active, update its collapse sign.
      const activeItems = nav.querySelectorAll('li.active') as NodeListOf<HTMLElement>;
      activeItems.forEach((li: HTMLElement) => {
        const parentLi = li.closest('li');
        if (parentLi) {
          const anchor = parentLi.querySelector('a');
          if (anchor) {
            const bElem = anchor.querySelector('b.collapse-sign');
            if (bElem) {
              this.renderer.setProperty(bElem, 'innerHTML', this.openedSign);
              this.renderer.setAttribute(anchor, 'aria-expanded', 'true');
            }
          }
        }
      });

      // Add click events on all anchors inside <li> elements.
      const anchorElements = nav.querySelectorAll('li > a') as NodeListOf<HTMLElement>;
      anchorElements.forEach((anchor: HTMLElement) => {
        const listener = this.renderer.listen(anchor, 'click', (event: Event) => {
          const li = (event.target as HTMLElement).closest('li');
          if (!li) {
            return;
          }

          const submenu = li.querySelector('ul');

          if (submenu) {
            // When clicking on a menu with submenu.
            // In accordion mode, close other submenus first.
            if (this.accordion && !this.isVisible(submenu)) {
              this.closeSiblings(li);
            }
            // Toggle open/closed.
            if (this.isVisible(submenu)) {
              this.slideUp(submenu, li, anchor);
            } else {
              this.slideDown(submenu, li, anchor);
              // Mark this branch as active.
              this.markActiveChain(li);
            }
            event.preventDefault();
          } else {
            // Leaf item (no submenu): mark it as active and also mark its entire ancestry as active.
            this.clearActiveClasses(nav);
            this.markActiveChain(li);
            // Let the default action (navigation) proceed.
          }
        });
        this.listeners.push(listener);
      });
    }
  }

  ngOnDestroy() {
    // Clean up all event listeners.
    this.listeners.forEach(unsubscribe => unsubscribe());
  }

  // Returns true if the element is visible (using the display property).
  private isVisible(elem: Element): boolean {
    return window.getComputedStyle(elem).display !== 'none';
  }

  // Slide down: show the submenu, add open and active classes, update collapse sign.
  private slideDown(submenu: Element, li: Element, anchor: Element) {
    this.renderer.setStyle(submenu, 'display', 'block');
    this.renderer.addClass(li, 'open');
    // this.renderer.addClass(li, 'active');
    this.renderer.setAttribute(anchor, 'aria-expanded', 'true');

    const bElem = anchor.querySelector('b.collapse-sign');
    if (bElem) {
      this.renderer.setProperty(bElem, 'innerHTML', this.openedSign);
    }
  }

  // Slide up: hide the submenu, remove open and active classes, update collapse sign.
  private slideUp(submenu: Element, li: Element, anchor: Element) {
    this.renderer.setStyle(submenu, 'display', 'none');
    this.renderer.removeClass(li, 'open');
    // Note: We remove active here because if the user is manually closing a menu,
    // it no longer should appear active.
    // this.renderer.removeClass(li, 'active');
    this.renderer.setAttribute(anchor, 'aria-expanded', 'false');

    const bElem = anchor.querySelector('b.collapse-sign');
    if (bElem) {
      this.renderer.setProperty(bElem, 'innerHTML', this.closedSign);
    }
  }

  // Close the submenus of sibling items.
  private closeSiblings(currentLi: Element) {
    const nav: HTMLElement = this.navMenu.nativeElement;
    const openSubmenus = nav.querySelectorAll('ul');
    openSubmenus.forEach((submenu: Element) => {
      if (this.isVisible(submenu) && !currentLi.contains(submenu)) {
        const parentLi = submenu.closest('li');
        if (parentLi) {
          const anchor = parentLi.querySelector('a');
          if (anchor) {
            this.slideUp(submenu, parentLi, anchor);
          }
        }
      }
    });
  }

  // Remove the active class from all li elements in the navigation.
  private clearActiveClasses(nav: HTMLElement) {
    const liElements = nav.querySelectorAll('li') as NodeListOf<HTMLElement>;
    liElements.forEach((li: HTMLElement) => {
      this.renderer.removeClass(li, 'active');
    });
  }

  // Marks the clicked li and all of its parent li elements as active,
  // ensuring that any parent submenu is open so that the active chain is visible.
  private markActiveChain(li: Element) {
    // Mark the clicked item as active.
    this.renderer.addClass(li, 'active');

    // Walk up through ancestors.
    let parent = li.parentElement;
    while (parent && parent !== this.navMenu.nativeElement) {
      // If the parent is a <ul>, then look for its containing <li>.
      if (parent.tagName.toLowerCase() === 'ul') {
        const parentLi = parent.closest('li');
        if (parentLi) {
          this.renderer.addClass(parentLi, 'active');
          this.renderer.addClass(parentLi, 'open');
          // Also ensure the submenu remains open.
          this.renderer.setStyle(parent, 'display', 'block');
          parent = parentLi.parentElement;
        } else {
          break;
        }
      } else {
        parent = parent.parentElement;
      }
    }
  }
  onLogout(){
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
  
}
