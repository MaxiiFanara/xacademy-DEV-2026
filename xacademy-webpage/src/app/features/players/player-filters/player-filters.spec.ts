import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerFilters } from './player-filters';

describe('PlayerFilters', () => {
  let component: PlayerFilters;
  let fixture: ComponentFixture<PlayerFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
