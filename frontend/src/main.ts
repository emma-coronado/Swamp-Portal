import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { StreamService } from './app/services/stream';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    const injector = appRef.injector;
    const streamService = injector.get(StreamService);
    streamService.connect();
  })
  .catch((err) => console.error(err));
