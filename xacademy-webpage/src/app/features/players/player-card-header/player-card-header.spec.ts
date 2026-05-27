import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerCardHeader } from './player-card-header';

describe('PlayerCardHeader', () => {
  let component: PlayerCardHeader;
  let fixture: ComponentFixture<PlayerCardHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerCardHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerCardHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
