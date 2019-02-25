import {Component, OnDestroy, OnInit} from '@angular/core';
import {concat, NEVER, timer, Subject} from 'rxjs';
import {scan, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnDestroy {

  //30 minutes
  private max = 1800;
  private start$ = new Subject();
  private pause$ = new Subject();
  private end$ = new Subject();

  public animationD = '';
  public isStarted = false;
  public isPaused = false;
  public minutes = '30';
  public seconds = '00';

  public togglePlayPause() {
    if (this.isPaused) {
      this.resumeTimer();
    } else if (!this.isStarted) {
      this.startTimer();
    } else {
      this.pauseTimer();
    }
  }

  startTimer(): void {
    this.isStarted = true;
    concat(this.start$, this.pause$)
      .pipe(
        switchMap(paused => (paused ? NEVER : timer(0, 1000))),
        scan(accum => accum - 1, this.max),
        takeUntil(this.end$)
      )
      .subscribe(this.updateInterval.bind(this));
    this.start$.next(this.isPaused);
  }

  pauseTimer() {
    this.isPaused = true;
    // this.runningTime += this.getCurrentDuration();
    this.start$.next(this.isPaused);
  }

  resumeTimer() {
    this.isPaused = false;
    this.start$.next(this.isPaused);
  }

  resetTimer(minutes, seconds) {
    this.minutes = minutes;
    this.seconds = seconds;
  }

  updateInterval(currentDuration: number) {
    this.minutes = Math.floor(currentDuration / 60).toString().padStart(2, '0');
    this.seconds = Math.floor(currentDuration % 60).toString().padStart(2, '0');

    currentDuration = this.max - currentDuration;
    currentDuration %= 360;

    const r = (currentDuration * Math.PI / 180)
      , x = Math.sin(r) * 125
      , y = Math.cos(r) * -125
      , mid = (currentDuration > 180) ? 1 : 0
      , anim = 'M 0 0 v -125 A 125 125 1 ' + mid + ' 1 ' + x + ' ' + y + ' z';

    if (r === 0) {
      this.togglePlayPause();
      return;
    }

    this.animationD = anim;

  }

  ngOnDestroy(): void {
    this.end$.next();
    this.end$.complete();

    this.resetTimer(30, 0);
  }
}
