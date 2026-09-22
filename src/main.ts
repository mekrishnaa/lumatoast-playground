import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initializeRenderer } from 'lumatoast';

// Initialize LumaToast DOM container once at startup
initializeRenderer();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
