import { reactive } from 'vue'
import { Product, type P } from './product'
import { Service } from './service'

export type GA = P & {
  agreementCount: number
  agreementComp: number
  service?: Product
}

export class GentlemanAgreement extends Product {
  agreementCount: number
  agreementComp: number
  service: Product | undefined

  constructor({ agreementCount, agreementComp, service, ...base }: GA) {
    super(base)
    this.agreementCount = agreementCount
    this.agreementComp = agreementComp
    this.service = service ?? undefined

    return reactive(this)
  }

  override get price() {
    return this.service?.price || 0
  }

  override get quantity() {
    return this.agreementComp + this.agreementCount
  }

  override toJson() {
    return {
      ...super.toJson(),
      agreementCount: this.agreementCount,
      agreementComp: this.agreementComp,
      service: this.service ? this.service.toJson() : false
    }
  }

  static override fromJson(product: any) {
    const {
      id,
      name,
      price,
      discount,
      type,
      category,
      serviceCharge,
      VAT,
      agreementCount,
      agreementComp,
      service = false
    } = product

    let _service = undefined
    if (service) {
      _service = Service.fromJson(service)
    }

    return new GentlemanAgreement({
      id,
      name,
      price,
      discount,
      type,
      category,
      serviceCharge,
      VAT,
      agreementCount,
      agreementComp,
      service: _service
    })
  }
}
