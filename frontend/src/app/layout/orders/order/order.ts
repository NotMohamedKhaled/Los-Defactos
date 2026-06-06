import { Component, Input, OnInit } from '@angular/core';
import { IOrder } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.servicets';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';
import { getOrderAddressView } from '../../../core/utils/order-address.util';

@Component({
  selector: 'app-order',
  imports: [DatePipe, CommonModule, RouterModule, ImageUrlPipe],
  templateUrl: './order.html',
  styleUrl: './order.css'
})
export class Order {
  @Input() myOrder!: IOrder;
  showAddress = false;

  constructor(private orderService: OrderService) {}

  get addressView() {
    return getOrderAddressView(this.myOrder);
  }

  toggleAddress(): void {
    this.showAddress = !this.showAddress;
  }

  cancelOrder(id: string) {
  this.orderService.cancelOrder(id).subscribe({
    next: () => {
      this.myOrder.orderStat = 'cancelled';
    },
    error: (err) => console.error('Failed to cancel order:', err),
  });
}

}
