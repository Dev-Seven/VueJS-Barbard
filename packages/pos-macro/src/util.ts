import { round, reduce, find } from "lodash";
import { Types } from "./constants.js";

const subTotal = (order: any) => {
  const { products, agreementServices } = order;
  return reduce(
    products,
    (acc, current) => {
      let service = {};
      if (current.category === Types.GentlemanAgreement) {
        service = find(agreementServices, (i) => i._agreement === current.id);
      }
      return acc + getSubTotalAmount(current, service);
    },
    0,
  );
};

const saleDiscount = (order: any) => {
  const { discount } = order;
  const _subTotal = subTotal(order);
  return {
    ...discount,
    amount:
      discount.type === "percentage"
        ? (_subTotal / 100) * discount.percentage
        : discount.amount,
    percentage:
      discount.type === "money"
        ? (discount.amount / _subTotal) * 100
        : discount.percentage,
  };
};

const salePromotion = ({ salePromotion, ...other }: any) => {
  // TODO
  if (salePromotion) {
    const _subTotal = subTotal(other);
    return {
      ...salePromotion,
      amount:
        salePromotion.type === "percentage"
          ? (_subTotal / 100) * salePromotion.percentage
          : salePromotion.amount,
      percentage:
        salePromotion.type === "money"
          ? (salePromotion.amount / _subTotal) * 100
          : salePromotion.percentage,
    };
  }
  return {
    ...salePromotion,
  };
};

export const getOriginalTotal = (product: any, service: any) => {
  if (product.category === Types.GentlemanAgreement) {
    if (!service?.id) {
      return 0;
    }

    const _vat = calculateVAT(service, true);
    const _serviceCharge = calculateServiceCharge(service, true);
    return round(
      (service.price + _vat + _serviceCharge) * product.agreementCount,
      -3,
    );
  }
  const total =
    (product.price +
      calculateVAT(product, true) +
      calculateServiceCharge(product, true)) *
    product.quantity;
  return round(total, -3);
};

export const getPriceToConsider = (product: any) => {
  if (product.discount) {
    return product.priceAfterDiscount;
  } else if (product.manualPrice) {
    return product.manualPrice;
  } else {
    return product.price;
  }
};

export const calculateVAT = (product: any, original = false) => {
  const serviceCharge = calculateServiceCharge(product, original);
  const _price = original ? product.price : getPriceToConsider(product);
  return product?.VAT?.amount
    ? ((_price + serviceCharge) / 100) * product.VAT.amount
    : 0;
};

export const calculateServiceCharge = (product: any, original = false) => {
  return product?.serviceCharge?.amount
    ? ((original ? product.price : getPriceToConsider(product)) / 100) *
        product.serviceCharge.amount
    : 0;
};

export const getTotalPayableAmount = (
  product: any,
  service: any,
  voidChargesByPercentage: any = null,
) => {
  let amount,
    _vat,
    _serviceCharge = 0;
  switch (product.category) {
    case Types.GentlemanAgreement:
      if (service?.id) {
        _vat = calculateVAT(service);
        _serviceCharge = calculateServiceCharge(service);

        if (voidChargesByPercentage) {
          _vat = _vat - (_vat / 100) * voidChargesByPercentage;
          _serviceCharge =
            _serviceCharge - (_serviceCharge / 100) * voidChargesByPercentage;
        }
        amount =
          (service.price + _vat + _serviceCharge) * product.agreementCount;
      }

      if (product.discount) {
        amount = amount! - (amount! / 100) * product.discount;
      }

      break;
    case Types.KingsAgreement:
      amount = product.price - (product.discount || 0);
      break;
    case Types.GiftCheque:
      amount = product.price;
      break;
    case Types.LockerBox:
      amount = product.price - (product.discount || 0);
      break;
    default:
      _vat = calculateVAT(product);
      _serviceCharge = calculateServiceCharge(product);

      if (voidChargesByPercentage) {
        _vat = _vat - (_vat / 100) * voidChargesByPercentage;
        _serviceCharge =
          _serviceCharge - (_serviceCharge / 100) * voidChargesByPercentage;
      }
      amount =
        (getPriceToConsider(product) + _vat + _serviceCharge) *
        product.quantity;
      break;
  }
  return round(amount, -3);
};

export const getSubTotalAmount = (product: any, service: any) => {
  let amount = 0;
  switch (product.category) {
    case Types.GentlemanAgreement:
      if (service?.id) {
        amount = service.price * product.agreementCount;
      }

      if (product.discount) {
        amount = amount - (amount / 100) * product.discount;
      }

      break;
    case Types.KingsAgreement:
      amount = product.price - (product.discount || 0);
      break;
    case Types.GiftCheque:
      amount = product.price;
      break;
    case Types.LockerBox:
      amount = product.price - (product.discount || 0);
      break;
    default:
      amount = getPriceToConsider(product) * product.quantity;
      break;
  }
  return round(amount, -3);
};

export const getLinkedService = (product: any, order: any) => {
  if (product.category !== Types.GentlemanAgreement) {
    return {};
  }
  return find(order.agreementServices, (i) => i._agreement === product.id);
};

export const assign = (product: any, order: any) => {
  const _product = { ...product };

  _product.service = getLinkedService(product, order);

  _product.originalTotal = getOriginalTotal(product, product.service);

  _product.vat =
    product.category === Types.GentlemanAgreement
      ? calculateVAT(product.service)
      : calculateVAT(product);

  _product.serviceCharge =
    product.category === Types.GentlemanAgreement
      ? calculateServiceCharge(product.service)
      : calculateServiceCharge(product);

  _product.priceToConsider = getPriceToConsider(product);

  _product.price =
    product.category === Types.GentlemanAgreement
      ? product.service.price
      : product.price;

  _product.total = getTotalPayableAmount(product, product.service);

  _product.saleDiscount = saleDiscount(order);
  _product.salePromotion = salePromotion(order);
  const voidChargesByPercentage =
    (_product.saleDiscount.percentage || 0) +
    (_product.salePromotion.percentage || 0);

  if (_product.category === Types.GentlemanAgreement) {
    const service = find(
      order.agreementServices,
      (i) => i._agreement === _product.id,
    );
    _product.totalPayableAmount = getTotalPayableAmount(
      product,
      service,
      voidChargesByPercentage,
    );
    _product.subTotal = getSubTotalAmount(product, service);
  } else {
    _product.totalPayableAmount = getTotalPayableAmount(
      product,
      null,
      voidChargesByPercentage,
    );
    _product.subTotal = getSubTotalAmount(product, {});
  }

  return _product;
};
