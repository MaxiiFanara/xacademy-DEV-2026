import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillTimeline } from './skill-timeline';

describe('SkillTimeline', () => {
  let component: SkillTimeline;
  let fixture: ComponentFixture<SkillTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillTimeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillTimeline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
