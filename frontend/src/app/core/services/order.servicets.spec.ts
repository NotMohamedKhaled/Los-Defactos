import { TestBed } from '@angular/core/testing';

import { OrderServicets } from './order.servicets';

describe('OrderServicets', () => {
  let service: OrderServicets;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderServicets);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
