import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProductTypes } from './product-type';

describe('ManageProductTypes', () => {
  let component: ManageProductTypes;
  let fixture: ComponentFixture<ManageProductTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageProductTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageProductTypes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
