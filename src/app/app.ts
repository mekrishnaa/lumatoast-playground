import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  toast,
  toastManager,
  configure,
  initializeRenderer,
  type ToastItem,
  type ToastTheme,
  type ToastPosition,
  type ToastAnimationEnter,
  type ToastAnimationExit,
  type ToastAnimationSpeed,
  type ToastActionVariant,
  type ToastProgressPosition,
  DURATION_SHORT,
  DURATION_DEFAULT,
  DURATION_LONG,
  MAX_VISIBLE_TOASTS,
} from 'lumatoast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  // Store unsubscribe callback from toast.subscribe()
  private unsubscribeToasts?: () => void;

  // Signal storing currently active toasts in the DOM
  protected readonly activeToasts = signal<ToastItem[]>([]);

  // Track the most recent toast ID to demonstrate toast.dismiss(id)
  protected readonly lastToastId = signal<string | null>(null);

  // Modal dialog state for showing code popup
  protected readonly modalOpen = signal<boolean>(false);
  protected readonly modalTitle = signal<string>('');
  protected readonly modalCode = signal<string>('');

  // UI Theme (Dark vs Light mode)
  protected readonly isLightMode = signal<boolean>(false);

  toggleTheme(): void {
    const next = !this.isLightMode();
    this.isLightMode.set(next);
    if (typeof document !== 'undefined') {
      if (next) {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    }
  }

  // Constants exposed for display
  protected readonly maxVisible = MAX_VISIBLE_TOASTS;
  protected readonly durationShort = DURATION_SHORT;
  protected readonly durationDefault = DURATION_DEFAULT;
  protected readonly durationLong = DURATION_LONG;
  protected readonly toast = toast;

  // Built-in theme presets with distinctive icons
  protected readonly themeList: { id: ToastTheme; name: string; icon: string }[] = [
    { id: 'linear', name: 'LINEAR', icon: '⚡' },
    { id: 'aurora', name: 'AURORA', icon: '🌌' },
    { id: 'vision', name: 'VISION', icon: '🥽' },
    { id: 'minimal', name: 'MINIMAL', icon: '◽' },
    { id: 'cupertino', name: 'CUPERTINO', icon: '🍎' },
    { id: 'material', name: 'MATERIAL', icon: '🎨' },
    { id: 'terminal', name: 'TERMINAL', icon: '💻' },
    { id: 'github', name: 'GITHUB', icon: '🐙' },
    { id: 'cyberpunk', name: 'CYBERPUNK', icon: '🕶️' },
  ];

  // Code snippets for all toasts
  protected readonly snippets = {
    success: `toast.success('Operation completed successfully!', {
  title: 'Success',
  description: 'Your changes have been saved to the database.'
});`,
    error: `toast.error('Failed to connect to the server.', {
  title: 'Error Occurred',
  description: 'Please check your internet connection and retry.'
});`,
    warning: `toast.warning('Low storage remaining.', {
  title: 'Warning',
  description: 'You have used 92% of your monthly storage quota.'
});`,
    info: `toast.info('A new software update is ready to install.', {
  title: 'System Notice',
  description: 'Version 2.4.0 includes performance improvements and bug fixes.'
});`,
    loading: `toast.loading('Processing payment...', {
  title: 'Please Wait',
  description: 'Securing transaction with bank servers.'
});`,
    custom: `toast.custom('Custom notification triggered!', {
  title: 'Custom Toast',
  description: 'Fully configured with customized layout and cyberpunk theme.',
  theme: 'cyberpunk'
});`,
    promiseSuccess: `toast.promise(fetch('https://dummyjson.com/quotes/random'), {
  loading: {
    title: 'Fetching Random Quote',
    description: 'Calling DummyJSON mock API...'
  },
  success: {
    title: 'Quote Retrieved!',
    description: 'Successfully received data from DummyJSON API.',
    duration: 5000
  },
  error: {
    title: 'API Request Failed',
    description: 'Could not fetch quote from server.'
  }
});`,
    promiseError: `toast.promise(fetch('https://dummyjson.com/http/500'), {
  loading: {
    title: 'Testing Failure Response',
    description: 'Requesting https://dummyjson.com/http/500...'
  },
  success: {
    title: 'Success',
    description: 'This will not be reached because the endpoint returns 500.'
  },
  error: {
    title: 'HTTP 500 Error Caught!',
    description: 'DummyJSON simulated server failure detected.',
    duration: 5000
  }
});`,
    update: `const loadingToast = toast.loading('Initiating mock API fetch...', {
  title: 'Sync in Progress',
  description: 'Connecting to jsonplaceholder.typicode.com...'
});

const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
const user = await res.json();

toast.update(loadingToast.id, {
  type: 'success',
  title: 'User Profile Synchronized',
  description: \`Loaded: \${user.name} (\${user.email})\`,
  duration: 5000,
  dismissible: true
});`,
    actionSolid: `toast.info('Action variant: "solid"', {
  title: 'Action Button Demo',
  description: 'Testing the "solid" action button variant.',
  duration: 6000,
  action: {
    label: 'Confirm',
    variant: 'solid',
    onClick: () => {
      toast.success('Clicked "solid" action button!', {
        title: 'Action Triggered',
        duration: 2500
      });
    }
  }
});`,
    actionOutline: `toast.info('Action variant: "outline"', {
  title: 'Action Button Demo',
  description: 'Testing the "outline" action button variant.',
  duration: 6000,
  action: {
    label: 'Undo',
    variant: 'outline',
    onClick: () => {
      toast.success('Clicked "outline" action button!', {
        title: 'Action Triggered',
        duration: 2500
      });
    }
  }
});`,
    actionGhost: `toast.info('Action variant: "ghost"', {
  title: 'Action Button Demo',
  description: 'Testing the "ghost" action button variant.',
  duration: 6000,
  action: {
    label: 'Dismiss',
    variant: 'ghost',
    onClick: () => {
      toast.success('Clicked "ghost" action button!', {
        title: 'Action Triggered',
        duration: 2500
      });
    }
  }
});`,
    animBounce: `toast.warning('Enter: bounce | Exit: fade', {
  title: 'Animation Demo',
  description: 'Toast enters via "bounce" and exits via "fade".',
  animationEnter: 'bounce',
  animationExit: 'fade',
  duration: 3500
});`,
    animScale: `toast.warning('Enter: scale | Exit: slide', {
  title: 'Animation Demo',
  description: 'Toast enters via "scale" and exits via "slide".',
  animationEnter: 'scale',
  animationExit: 'slide',
  duration: 3500
});`,
    animFade: `toast.warning('Enter: fade | Exit: fade', {
  title: 'Animation Demo',
  description: 'Toast enters via "fade" and exits via "fade".',
  animationEnter: 'fade',
  animationExit: 'fade',
  duration: 3500
});`,
    animNone: `toast.warning('Enter: none | Exit: none', {
  title: 'Animation Demo',
  description: 'Instant appearance with no enter/exit delay.',
  animationEnter: 'none',
  animationExit: 'none',
  duration: 3500
});`,
    progressTop: `toast.info('Progress Bar at TOP', {
  title: 'Progress Bar Position',
  description: 'Countdown bar is attached to the top of this toast card.',
  progressPosition: 'top',
  duration: 5000
});`,
    progressBottom: `toast.info('Progress Bar at BOTTOM', {
  title: 'Progress Bar Position',
  description: 'Countdown bar is attached to the bottom of this toast card.',
  progressPosition: 'bottom',
  duration: 5000
});`,
    closeOnClick: `toast.info('Click anywhere on this card to dismiss it!', {
  title: 'Click to Dismiss',
  description: 'closeOnClick is set to true. Click this card!',
  closeOnClick: true,
  duration: 8000
});`,
    hideIcon: `toast.success('This toast has no leading icon.', {
  title: 'Icon Hidden',
  description: 'showIcon is set to false.',
  showIcon: false,
  duration: 4000
});`,
    nonDismissible: `toast.warning('Close button is hidden.', {
  title: 'Non-Dismissible (No X Button)',
  description: 'This toast will automatically disappear when duration completes.',
  dismissible: false,
  duration: 4000
});`,
    inlineStyles: `toast.custom('Custom styled card with CSS variables', {
  title: 'Inline CSS Variables',
  description: 'Configured with custom gradient background and glow.',
  duration: 5000,
  style: {
    '--luma-bg': 'linear-gradient(135deg, #2e1065, #3b0764)',
    '--luma-radius': '24px',
    '--luma-shadow': '0 0 25px rgba(168, 85, 247, 0.5)',
    '--luma-border-color': 'rgba(168, 85, 247, 0.4)'
  }
});`,
    customClass: `toast.info('Styled via custom CSS class (.my-brand-toast)', {
  title: 'Custom CSS Class',
  description: 'Card styling driven by custom stylesheet rules.',
  className: 'my-brand-toast',
  duration: 5000
});`,
    customTheme: `toast.success('Custom brand theme applied!', {
  title: 'Brand Theme',
  description: 'Using custom CSS tokens: --luma-bg, --luma-title-color, etc.',
  theme: 'brand' as ToastTheme,
  duration: 5000
});`,
    presetCyber: `toast.configure({
  position: 'bottom-right',
  theme: 'cyberpunk',
  duration: 3000,
  progressPosition: 'top',
  animationEnter: 'bounce',
  animationSpeed: 'fast'
});`,
    presetMinimal: `toast.configure({
  position: 'top-center',
  theme: 'minimal',
  duration: 2500,
  animationEnter: 'fade',
  animationSpeed: 'slow'
});`,
    presetDefault: `toast.configure({
  position: 'top-right',
  theme: 'linear',
  duration: 4000,
  progressPosition: 'bottom',
  animationEnter: 'slide',
  animationExit: 'slide',
  animationSpeed: 'normal'
});`,
    inspectManager: `const active = toastManager.getToasts();
console.log('[LumaToast Manager Active Toasts]:', active);`,
    dismissId: `const id = this.lastToastId();
if (id) {
  toast.dismiss(id);
}`,
    dismissLatest: `toast.dismissLatest(); // Also triggered by pressing Escape key`,
    dismissAll: `toast.dismissAll(); // Removes all active and queued toasts immediately`,
    durationShort: `toast.success('Dismisses in 2 seconds (short).', {
  title: 'Short Duration (2s)',
  duration: 2000 // or DURATION_SHORT
});`,
    durationDefault: `toast.info('Dismisses in 4 seconds (default).', {
  title: 'Default Duration (4s)',
  duration: 4000 // or DURATION_DEFAULT
});`,
    durationLong: `toast.warning('Dismisses in 8 seconds (long).', {
  title: 'Long Duration (8s)',
  duration: 8000 // or DURATION_LONG
});`,
    durationInfinite: `toast.info('This toast stays until dismissed or action is clicked.', {
  title: 'Infinite Duration',
  duration: Infinity,
  dismissible: true,
  action: {
    label: 'Dismiss Now',
    variant: 'solid',
    onClick: () => {
      toast.success('Infinite toast dismissed!', { duration: 2000 });
    }
  }
});`,
  };

  // Interactive Global Config Builder state
  protected readonly configTheme = signal<ToastTheme>('linear');
  protected readonly configPosition = signal<ToastPosition>('top-right');
  protected readonly configEnter = signal<ToastAnimationEnter>('slide');
  protected readonly configExit = signal<ToastAnimationExit>('slide');
  protected readonly configProgress = signal<ToastProgressPosition>('bottom');
  protected readonly configSpeed = signal<ToastAnimationSpeed>('normal');
  protected readonly configType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  protected readonly configTitle = signal<string>('Custom Toast');
  protected readonly configMessage = signal<string>('Triggered with custom global configuration!');

  // Duration variants methods
  showDurationShort(): void {
    const item = toast.success('Dismisses in 2 seconds (short).', {
      title: 'Short Duration (2s)',
      duration: DURATION_SHORT,
    });
    this.lastToastId.set(item.id);
  }

  showDurationDefault(): void {
    const item = toast.info('Dismisses in 4 seconds (default).', {
      title: 'Default Duration (4s)',
      duration: DURATION_DEFAULT,
    });
    this.lastToastId.set(item.id);
  }

  showDurationLong(): void {
    const item = toast.warning('Dismisses in 8 seconds (long).', {
      title: 'Long Duration (8s)',
      duration: 8000,
    });
    this.lastToastId.set(item.id);
  }

  showDurationInfinite(): void {
    const item = toast.info('This toast stays until dismissed or action is clicked.', {
      title: 'Infinite Duration',
      duration: Infinity,
      dismissible: true,
      action: {
        label: 'Dismiss Now',
        variant: 'solid',
        onClick: () => {
          toast.success('Infinite toast dismissed!', { duration: 2000 });
        },
      },
    });
    this.lastToastId.set(item.id);
  }

  // Interactive Config Builder method
  applyAndFireConfig(): void {
    // 1. Configure global defaults
    toast.configure({
      theme: this.configTheme(),
      position: this.configPosition(),
      animationEnter: this.configEnter(),
      animationExit: this.configExit(),
      progressPosition: this.configProgress(),
      animationSpeed: this.configSpeed(),
    });

    // 2. Fire the toast event with the chosen type
    const type = this.configType();
    const item = toast[type](this.configMessage(), {
      title: this.configTitle(),
    });
    this.lastToastId.set(item.id);
  }

  getConfiguredCodeSnippet(): string {
    return `// 1. Set global configuration
toast.configure({
  theme: '${this.configTheme()}',
  position: '${this.configPosition()}',
  animationEnter: '${this.configEnter()}',
  animationExit: '${this.configExit()}',
  progressPosition: '${this.configProgress()}',
  animationSpeed: '${this.configSpeed()}'
});

// 2. Fire toast (inherits all global settings)
toast.${this.configType()}('${this.configMessage()}', {
  title: '${this.configTitle()}'
});`;
  }

  openModal(title: string, code: string): void {
    this.modalTitle.set(title);
    this.modalCode.set(code);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  copyModalCode(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.modalCode().trim()).then(() => {
        this.closeModal();
        toast.success('Code copied to clipboard!', {
          title: 'Copied',
          duration: 2000,
          showIcon: true,
        });
      });
    } else {
      this.closeModal();
    }
  }

  getThemeSnippet(th: string): string {
    return `toast.info('Theme: ${th.toUpperCase()}', {
  title: '${th.charAt(0).toUpperCase() + th.slice(1)} Theme',
  description: 'This toast is rendered using the built-in "${th}" theme.',
  theme: '${th}' as ToastTheme,
  duration: 4000
});`;
  }

  getPositionSnippet(pos: string): string {
    return `toast.success('Position: ${pos}', {
  title: 'Screen Position',
  description: 'Rendered at the "${pos}" viewport anchor.',
  position: '${pos}' as ToastPosition,
  duration: 3500
});`;
  }

  ngOnInit(): void {
    // Ensure LumaToast container is initialized
    initializeRenderer();

    /**
     * =========================================================================
     * FEATURE: toast.subscribe(listener)
     * =========================================================================
     * What it does:
     * - Subscribes to real-time changes in the toast manager (when toasts are
     *   added, updated, or removed).
     * - Returns an unsubscribe function to prevent memory leaks when destroyed.
     * - Useful for displaying active toast badges, counters, or debug inspectors.
     */
    this.unsubscribeToasts = toast.subscribe((toasts: ToastItem[]) => {
      this.activeToasts.set([...toasts]);
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from toast updates when component unmounts
    if (this.unsubscribeToasts) {
      this.unsubscribeToasts();
    }
  }

  /**
   * Helper utility to copy code snippet to user clipboard
   * and trigger a quick confirmation toast.
   */
  copyCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code.trim()).then(() => {
        toast.success('Snippet copied to clipboard!', {
          title: 'Code Copied',
          duration: 2000,
          showIcon: true,
        });
      });
    }
  }

  copyThemeCode(th: string): void {
    this.copyCode(`toast.info('Theme: ${th.toUpperCase()}', {\n  title: '${th} Theme',\n  theme: '${th}'\n});`);
  }

  copyPositionCode(pos: string): void {
    this.copyCode(`toast.success('Anchor: ${pos}', {\n  position: '${pos}',\n  duration: 3500\n});`);
  }

  // ===========================================================================
  // 1. BASIC TOAST TYPES (toast.success, toast.error, toast.warning, etc.)
  // ===========================================================================

  /**
   * FEATURE: toast.success(message, options?)
   * What it does:
   * - Shows a success toast with a green accent bar and a checkmark icon.
   * - Useful for confirming successful user actions (e.g. save, copy, submit).
   */
  showSuccess(): void {
    const item = toast.success('Operation completed successfully!', {
      title: 'Success',
      description: 'Your changes have been saved to the database.',
    });
    this.lastToastId.set(item.id);
  }

  /**
   * FEATURE: toast.error(message, options?)
   * What it does:
   * - Displays an error toast with a red accent bar and warning/error icon.
   * - Useful for failed operations, network failures, or validation errors.
   */
  showError(): void {
    const item = toast.error('Failed to connect to the server.', {
      title: 'Error Occurred',
      description: 'Please check your internet connection and retry.',
    });
    this.lastToastId.set(item.id);
  }

  /**
   * FEATURE: toast.warning(message, options?)
   * What it does:
   * - Displays an amber/yellow warning toast with an alert icon.
   * - Useful for warnings (e.g. low storage space, unsaved drafts, expiring sessions).
   */
  showWarning(): void {
    const item = toast.warning('Low storage remaining.', {
      title: 'Warning',
      description: 'You have used 92% of your monthly storage quota.',
    });
    this.lastToastId.set(item.id);
  }

  /**
   * FEATURE: toast.info(message, options?)
   * What it does:
   * - Displays a blue informational toast with an information circle icon.
   * - Useful for system notices, tips, feature announcements, and updates.
   */
  showInfo(): void {
    const item = toast.info('A new software update is ready to install.', {
      title: 'System Notice',
      description: 'Version 2.4.0 includes performance improvements and bug fixes.',
    });
    this.lastToastId.set(item.id);
  }

  /**
   * FEATURE: toast.loading(message, options?)
   * What it does:
   * - Shows a persistent spinner toast with duration set to Infinity and dismissible set to false.
   * - Remains on screen until programmatically dismissed or converted with toast.update().
   * - Useful for long-running operations, background uploads, or multi-step tasks.
   */
  showLoading(): void {
    const item = toast.loading('Processing payment...', {
      title: 'Please Wait',
      description: 'Securing transaction with bank servers.',
    });
    this.lastToastId.set(item.id);
  }

  /**
   * FEATURE: toast.custom(message, options?)
   * What it does:
   * - Shows a flexible custom toast with a purple accent and customizable icon/theme.
   * - Gives full freedom over styling and structure.
   */
  showCustom(): void {
    const item = toast.custom('Custom notification triggered!', {
      title: 'Custom Toast',
      description: 'Fully configured with customized layout and cyberpunk theme.',
      theme: 'cyberpunk',
    });
    this.lastToastId.set(item.id);
  }

  // ===========================================================================
  // 2. PROMISE & ASYNC API (toast.promise with Real Mock APIs)
  // ===========================================================================

  /**
   * FEATURE: toast.promise(promise, options) - SUCCESSFUL MOCK API CALL
   * What it does:
   * - Automatically manages toast state transitions based on Promise lifecycle:
   *   1. Displays loading toast while the promise is pending.
   *   2. Automatically updates to success toast when the promise resolves.
   *   3. Automatically updates to error toast if the promise rejects.
   *
   * Mock API Used:
   * - DummyJSON Quotes API (https://dummyjson.com/quotes/random)
   */
  async testPromiseSuccess(): Promise<void> {
    const fetchRandomQuote = fetch('https://dummyjson.com/quotes/random')
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      });

    try {
      await toast.promise(fetchRandomQuote, {
        loading: {
          title: 'Fetching Random Quote',
          description: 'Calling DummyJSON mock API...',
        },
        success: {
          title: 'Quote Retrieved!',
          description: 'Successfully received data from DummyJSON API.',
          duration: 5000,
        },
        error: {
          title: 'API Request Failed',
          description: 'Could not fetch quote from server.',
        },
      });
    } catch {
      // Promise rejection handled by toast
    }
  }

  /**
   * FEATURE: toast.promise(promise, options) - FAILING MOCK API CALL
   * What it does:
   * - Verifies that toast.promise transitions seamlessly to the error state
   *   when the promise encounters an HTTP error or rejects.
   *
   * Mock API Used:
   * - DummyJSON 404/500 endpoint (https://dummyjson.com/http/500)
   */
  async testPromiseError(): Promise<void> {
    const failingRequest = fetch('https://dummyjson.com/http/500')
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return await res.json();
      });

    try {
      await toast.promise(failingRequest, {
        loading: {
          title: 'Testing Failure Response',
          description: 'Requesting https://dummyjson.com/http/500...',
        },
        success: {
          title: 'Success',
          description: 'This will not be reached because the endpoint returns 500.',
        },
        error: {
          title: 'HTTP 500 Error Caught!',
          description: 'DummyJSON simulated server failure detected.',
          duration: 5000,
        },
      });
    } catch {
      // Handled by toast.promise
    }
  }

  // ===========================================================================
  // 3. IN-PLACE UPDATE API (toast.update)
  // ===========================================================================

  /**
   * FEATURE: toast.update(id, updates)
   * What it does:
   * - Updates an existing toast in-place using its unique id.
   * - Smoothly mutates type (e.g. from loading to success), title, description,
   *   duration, and dismissible flag without unmounting the toast card.
   *
   * Mock API Used:
   * - JSONPlaceholder Users API (https://jsonplaceholder.typicode.com/users/1)
   */
  async testManualUpdateWithApi(): Promise<void> {
    // 1. Create a loading toast that does not auto-dismiss
    const loadingToast = toast.loading('Initiating mock API fetch...', {
      title: 'Sync in Progress',
      description: 'Connecting to jsonplaceholder.typicode.com...',
    });
    this.lastToastId.set(loadingToast.id);

    try {
      // 2. Fetch mock user data
      const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
      const user = await res.json();

      // 3. Use toast.update() to transform the loading toast into a success toast
      toast.update(loadingToast.id, {
        type: 'success',
        title: 'User Profile Synchronized',
        description: `Loaded: ${user.name} (${user.email})`,
        duration: 5000,
        dismissible: true,
      });
    } catch (err) {
      // 4. In case of error, update the toast to error type
      toast.update(loadingToast.id, {
        type: 'error',
        title: 'Sync Failed',
        description: (err as Error).message || 'Unknown network error',
        duration: 4000,
        dismissible: true,
      });
    }
  }

  // ===========================================================================
  // 4. ACTION BUTTONS & VARIANTS (solid, outline, ghost)
  // ===========================================================================

  /**
   * FEATURE: action: { label, onClick, variant?: 'solid' | 'outline' | 'ghost' }
   * What it does:
   * - Renders an interactive action button inside the toast card.
   * - Clicking the button invokes your callback handler.
   * - Supports 3 visual variants:
   *   - "solid": Filled background (default)
   *   - "outline": Transparent background with styled border
   *   - "ghost": Minimalist text-only button with no border or background
   */
  showActionToast(variant: ToastActionVariant): void {
    const item = toast.info(`Action variant: "${variant}"`, {
      title: 'Action Button Demo',
      description: `Testing the "${variant}" action button variant.`,
      duration: 6000,
      action: {
        label: variant === 'solid' ? 'Confirm' : variant === 'outline' ? 'Undo' : 'Dismiss',
        variant: variant,
        onClick: () => {
          toast.success(`Clicked "${variant}" action button!`, {
            title: 'Action Triggered',
            duration: 2500,
          });
        },
      },
    });
    this.lastToastId.set(item.id);
  }

  // ===========================================================================
  // 5. ALL 9 THEMES (linear, aurora, vision, minimal, cupertino, etc.)
  // ===========================================================================

  /**
   * FEATURE: theme: ToastTheme
   * What it does:
   * - Applies one of LumaToast's 9 built-in visual design themes:
   *   - "linear": Linear-inspired dark frosted glassmorphism (default)
   *   - "aurora": Vibrant multi-color gradient lighting
   *   - "vision": Apple VisionOS spatial frosted glass
   *   - "minimal": High-contrast monochrome clean style
   *   - "cupertino": Apple iOS clean light/dark aesthetic
   *   - "material": Google Material Design 3 elevation and shape
   *   - "terminal": Retro green-on-black hacker console look
   *   - "github": GitHub primer developer UI design
   *   - "cyberpunk": High-voltage neon magenta/cyan futuristic style
   */
  showTheme(theme: ToastTheme): void {
    const item = toast.info(`Theme: ${theme.toUpperCase()}`, {
      title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`,
      description: `This toast is rendered using the built-in "${theme}" theme.`,
      theme: theme,
      duration: 4000,
    });
    this.lastToastId.set(item.id);
  }

  // ===========================================================================
  // 6. ALL 6 POSITIONS (top-left, top-center, top-right, etc.)
  // ===========================================================================

  /**
   * FEATURE: position: ToastPosition
   * What it does:
   * - Controls where on the screen the toast container renders:
   *   - "top-left", "top-center", "top-right"
   *   - "bottom-left", "bottom-center", "bottom-right"
   */
  showPosition(position: ToastPosition): void {
    const item = toast.success(`Position: ${position}`, {
      title: 'Screen Position',
      description: `Rendered at the "${position}" viewport anchor.`,
      position: position,
      duration: 3500,
    });
    this.lastToastId.set(item.id);
  }

  // ===========================================================================
  // 7. ANIMATIONS (Enter & Exit)
  // ===========================================================================

  /**
   * FEATURE: animationEnter & animationExit
   * What it does:
   * - animationEnter: Controls entrance motion ("slide", "fade", "scale", "bounce", "none")
   * - animationExit: Controls exit motion ("slide", "fade", "none")
   */
  showAnimation(enter: ToastAnimationEnter, exit: ToastAnimationExit): void {
    const item = toast.warning(`Enter: ${enter} | Exit: ${exit}`, {
      title: 'Animation Demo',
      description: `Toast enters via "${enter}" and exits via "${exit}".`,
      animationEnter: enter,
      animationExit: exit,
      duration: 3500,
    });
    this.lastToastId.set(item.id);
  }

  // ===========================================================================
  // 8. PROGRESS BAR POSITIONS (Top vs Bottom)
  // ===========================================================================

  /**
   * FEATURE: progressPosition: 'top' | 'bottom'
   * What it does:
   * - Controls whether the countdown timer progress bar appears at the top or bottom of the card.
   */
  showProgressPosition(pos: ToastProgressPosition): void {
    const item = toast.info(`Progress Bar at ${pos.toUpperCase()}`, {
      title: 'Progress Bar Position',
      description: `Countdown bar is attached to the ${pos} of this toast card.`,
      progressPosition: pos,
      duration: 5000,
    });
    this.lastToastId.set(item.id);
  }

  // ===========================================================================
  // 9. CARD INTERACTION OPTIONS (closeOnClick, showIcon, dismissible)
  // ===========================================================================

  /**
   * FEATURE: closeOnClick: true
   * What it does:
   * - Allows the user to dismiss the toast by clicking anywhere on the card body,
   *   rather than requiring them to hit the small 'x' close button.
   */
  showCloseOnClick(): void {
    const item = toast.info('Click anywhere on this card to dismiss it!', {
      title: 'Click to Dismiss',
      description: 'closeOnClick is set to true. Click this card!',
      closeOnClick: true,
      duration: 8000,
    });
    this.lastToastId.set(item.id);
  }

  /**
   * FEATURE: showIcon: false
   * What it does:
   * - Hides the leading status/type icon for a cleaner, text-only appearance.
   */
  showWithoutIcon(): void {
    const item = toast.success('This toast has no leading icon.', {
      title: 'Icon Hidden',
      description: 'showIcon is set to false.',
      showIcon: false,
      duration: 4000,
    });
    this.lastToastId.set(item.id);
  }

  /**
   * FEATURE: dismissible: false
   * What it does:
   * - Hides the close 'x' button entirely, requiring either auto-dismiss or programmatic dismissal.
   */
  showNonDismissible(): void {
    const item = toast.warning('Close button is hidden.', {
      title: 'Non-Dismissible (No X Button)',
      description: 'This toast will automatically disappear when duration completes.',
      dismissible: false,
      duration: 4000,
    });
    this.lastToastId.set(item.id);
  }

  // ===========================================================================
  // 10. CUSTOM STYLING & CSS VARIABLES
  // ===========================================================================

  /**
   * FEATURE: style: Record<string, string>
   * What it does:
   * - Directly applies inline CSS rules and LumaToast CSS custom properties (--luma-*)
   *   to the toast card.
   *
   * Demonstrated Variables:
   * - --luma-bg: Custom gradient background
   * - --luma-radius: Custom rounded corners (24px)
   * - --luma-shadow: Glowing violet box shadow
   */
  showInlineStyles(): void {
    const item = toast.custom('Custom styled card with CSS variables', {
      title: 'Inline CSS Variables',
      description: 'Configured with custom gradient background and glow.',
      duration: 5000,
      style: {
        '--luma-bg': 'linear-gradient(135deg, #2e1065, #3b0764)',
        '--luma-radius': '24px',
        '--luma-shadow': '0 0 25px rgba(168, 85, 247, 0.5)',
        '--luma-border-color': 'rgba(168, 85, 247, 0.4)',
      },
    });
    this.lastToastId.set(item.id);
  }

  /**
   * FEATURE: className: string
   * What it does:
   * - Adds a custom CSS class to the toast wrapper element for external CSS targeting.
   * - Uses `.my-brand-toast` defined in styles.css.
   */
  showCustomClass(): void {
    const item = toast.info('Styled via custom CSS class (.my-brand-toast)', {
      title: 'Custom CSS Class',
      description: 'Card styling driven by custom stylesheet rules.',
      className: 'my-brand-toast',
      duration: 5000,
    });
    this.lastToastId.set(item.id);
  }

  /**
   * FEATURE: Custom Theme via .luma-theme-[name]
   * What it does:
   * - Uses the custom theme defined in styles.css (.luma-theme-brand)
   *   which defines custom typography, glow, and colors.
   */
  showCustomTheme(): void {
    const item = toast.success('Custom brand theme applied!', {
      title: 'Brand Theme',
      description: 'Using custom CSS tokens: --luma-bg, --luma-title-color, etc.',
      theme: 'brand' as ToastTheme,
      duration: 5000,
    });
    this.lastToastId.set(item.id);
  }

  // ===========================================================================
  // 11. PROGRAMMATIC DISMISSAL (toast.dismiss, dismissLatest, dismissAll)
  // ===========================================================================

  /**
   * FEATURE: toast.dismiss(id)
   * What it does:
   * - Programmatically dismisses a specific toast using its unique ID.
   */
  dismissLastToast(): void {
    const id = this.lastToastId();
    if (id) {
      toast.dismiss(id);
      this.lastToastId.set(null);
    } else {
      toast.info('No recorded toast ID to dismiss.');
    }
  }

  /**
   * FEATURE: toast.dismissLatest()
   * What it does:
   * - Dismisses the most recently created active toast.
   * - Note: The user can also press the "Escape" key on their keyboard to trigger this!
   */
  dismissLatest(): void {
    toast.dismissLatest();
  }

  /**
   * FEATURE: toast.dismissAll()
   * What it does:
   * - Clears and removes all visible and queued toasts immediately.
   */
  dismissAll(): void {
    toast.dismissAll();
    this.lastToastId.set(null);
  }

  // ===========================================================================
  // 12. GLOBAL CONFIGURATION (toast.configure / configure)
  // ===========================================================================

  /**
   * FEATURE: toast.configure(config)
   * What it does:
   * - Sets default configuration options across the entire application.
   * - Every subsequent toast will inherit these options unless overridden locally.
   *
   * Configurable options:
   * - position: Default screen position
   * - theme: Default theme
   * - duration: Default duration in ms
   * - dismissible: Whether the close button is visible
   * - maxVisible: Maximum concurrent toasts visible
   * - animationSpeed: Global animation speed preset ('slow', 'normal', 'fast')
   * - progressPosition: 'top' | 'bottom'
   * - animationEnter & animationExit
   */
  applyGlobalPreset(preset: 'default' | 'cyber' | 'minimal'): void {
    if (preset === 'cyber') {
      toast.configure({
        position: 'bottom-right',
        theme: 'cyberpunk',
        duration: 3000,
        progressPosition: 'top',
        animationEnter: 'bounce',
        animationSpeed: 'fast',
      });
      toast.info('Global preset changed to CYBERPUNK (Bottom-Right, Fast, Top Bar)');
    } else if (preset === 'minimal') {
      toast.configure({
        position: 'top-center',
        theme: 'minimal',
        duration: 2500,
        progressPosition: 'bottom',
        animationEnter: 'fade',
        animationSpeed: 'slow',
      });
      toast.info('Global preset changed to MINIMAL (Top-Center, Slow Fade)');
    } else {
      toast.configure({
        position: 'top-right',
        theme: 'linear',
        duration: 4000,
        progressPosition: 'bottom',
        animationEnter: 'slide',
        animationExit: 'slide',
        animationSpeed: 'normal',
      });
      toast.info('Global preset reset to DEFAULT LINEAR (Top-Right, Slide)');
    }
  }

  /**
   * FEATURE: toastManager.getToasts()
   * What it does:
   * - Inspects the active toast instances stored in ToastManager.
   */
  inspectManagerToasts(): void {
    const active = toastManager.getToasts();
    console.log('[LumaToast Manager Active Toasts]:', active);
    toast.info(`Active in Manager: ${active.length} toast(s). Check browser console for full objects.`, {
      title: 'Toast Manager Inspection',
      duration: 3000,
    });
  }
}
