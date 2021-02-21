import { Injectable } from '@angular/core';
import { Observable, fromEvent, merge, Subject, timer } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BnNgIdleService {

  private idle$: Observable<any>;
  private timer$;
  private timeOutMilliSeconds: number;
  private idleSubscription;

  public expired$: Subject<boolean> = new Subject<boolean>();

  constructor() {

  }

  public startWatching(timeOutSeconds): Observable<any> {
    this.idle$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'click'),
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keypress'),
      fromEvent(document, 'DOMMouseScroll'),
      fromEvent(document, 'mousewheel'),
      fromEvent(document, 'touchmove'),
      fromEvent(document, 'MSPointerMove'),
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'resize'),
    );

    this.timeOutMilliSeconds = timeOutSeconds * 1000;

    this.idleSubscription = this.idle$.subscribe((res) => {
      this.resetTimer();
    });

    this.startTimer();

    return this.expired$;
  }

  private startTimer() {
    localStorage.setItem('idleTimeout', Date.now());

    // run timer every 1 second and check if we've reached timeout
    this.timer$ = timer(1000, 1000).subscribe((res) => {
        // check cached time in case another tab was active
        const cachedTime = parseInt(localStorage.getItem('idleTimeout')) || Date.now();

        // idle true
        if (Date.now() - cachedTime > this.timeoutMilliSeconds) {
            this.expired$.next(true);
        }
        // idle false   
        else {
            this.expired$.next(false);
        }         
    });
}

  public resetTimer() {
    this.timer$.unsubscribe();
    this.startTimer();
  }

  public stopTimer() {
    this.timer$.unsubscribe();
    this.idleSubscription.unsubscribe();
  }
}
