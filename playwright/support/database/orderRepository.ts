import { db } from './database'
import { OrderTable } from './schema'

import { OrderDetails } from '../actions/orderLookupActions'

import crypto from 'crypto'

export function normalizeValue(value: string) {
  if (!value) return '';

  return value
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, '') // remove espaços
    .toLowerCase(); // lowercase
}

type OrderSeedCustomer = OrderDetails['customer'] & {
  phone: string
  document: string
}

export type OrderSeed = Omit<OrderDetails, 'customer'> & {
  customer: OrderSeedCustomer
  total_price: string
}

export function toOrderDetails(order: OrderSeed): OrderDetails {
  return {
    number: order.number,
    status: order.status,
    color: order.color,
    wheels: order.wheels,
    customer: {
      name: order.customer.name,
      email: order.customer.email,
    },
    payment: order.payment,
  }
}

export async function insertOrder(order: OrderSeed) {

  const data: OrderTable = {
    id: crypto.randomUUID(),
    order_number: order.number,
    color: order.color.toLowerCase().replace(' ', '-'),
    wheel_type: order.wheels.replace(' Wheels', '').toLowerCase(),
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    customer_cpf: order.customer.document,
    payment_method: normalizeValue(order.payment),
    total_price: order.total_price,
    status: order.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    optionals: [],
  }
  // If the record exists it might throw a duplicate error, but we manage teardown.
  await db.insertInto('orders').values(data).execute()
}

export async function deleteOrderByNumber(orderNumber: string) {
  await db.deleteFrom('orders').where('order_number', '=', orderNumber).execute()
}

export async function deleteOrderByEmail(email: string) {
  await db.deleteFrom('orders').where('customer_email', '=', email).execute()
}