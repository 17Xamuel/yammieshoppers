class Deduct {
  constructor(product) {
    this.product = product;
  }
  urgency() {
    if (this.product.urgent == "express") {
      return this.product.price * 0.02;
    } else {
      return this.product.price * 0.01;
    }
  }
  qty() {
    if (this.product.qty == "few") {
      return this.product.price * 0.03;
    } else {
      return this.product.price * 0.01;
    }
  }
  size() {
    if (this.product.size == "big") {
      return this.product.price * 0.02;
    } else {
      return this.product.price * 0.01;
    }
  }
  weight() {
    if (this.product.weight == "heavy") {
      return this.product.price * 0.02;
    } else {
      return this.product.price * 0.01;
    }
  }
  fragile() {
    if (this.product.fragile == true) return this.product.price * 0.02;
    else return this.product.price * 0.01;
  }
  location() {
    if (this.product.location == "kla") return this.product.price * 0.05;
    else return this.product.price * 0.02;
  }
  userLocation() {
    let delivery = 0;
    switch (this.product.user) {
      case "keturah":
        delivery = this.product.price * 0.002;
        break;
      case "royal":
        delivery = this.product.price * 0.002;
        break;
      case "maisha":
        delivery = this.product.price * 0.0001;
        break;
      case "pioneer":
        delivery = this.product.price * 0.001;
        break;
      case "washington":
        delivery = this.product.price * 0.0015;
        break;
      case "st. peters":
        delivery = this.product.price * 0.002;
        break;
      case "pacuwa":
        delivery = this.product.price * 0.0025;
        break;
      case "northern elite":
        delivery = this.product.price * 0.001;
        break;
      case "jeremiah":
        delivery = this.product.price * 0.0015;
        break;
      case "hospital":
        delivery = this.product.price * 0.002;
        break;
      case "management":
        delivery = this.product.price * 0.0015;
        break;
      case "education":
        delivery = this.product.price * 0.002;
        break;
      default:
        delivery = this.product.price * 0.001;
        break;
    }
    return delivery;
  }
  get factorPrice() {
    return (
      this.location() +
      this.fragile() +
      this.qty() +
      this.urgency() +
      this.size() +
      this.userLocation()
    );
  }
  index() {
    let index;
    if (this.product.price >= 5000 && this.product.price <= 20000) {
      index = this.factorPrice * 0.9;
    } else if (this.product.price >= 20001 && this.product.price <= 100000) {
      index = this.factorPrice * 0.8;
    } else if (this.product.price >= 100001 && this.product.price <= 250000) {
      index = this.factorPrice * 0.7;
    } else if (this.product.price >= 250001 && this.product.price <= 600000) {
      index = this.factorPrice * 0.6;
    } else if (this.product.price >= 600001 && this.product.price <= 1000000) {
      index = this.factorPrice * 0.5;
    } else if (this.product.price >= 1000001 && this.product.price <= 1500000) {
      index = this.factorPrice * 0.4;
    } else if (this.product.price > 1500000) {
      index = this.factorPrice * 0.4;
    } else {
      index = this.factorPrice * 1;
    }
    return index;
  }
  round(i) {
    if (i % 10 != 0 || (i / 10) % 10 != 0) {
      return parseInt(i / 100) * 100 + 100;
    }
  }
  get total() {
    if (
      this.index() < 0.1 * this.product.price &&
      this.product.price < 25000 &&
      this.product.location == "lira"
    ) {
      return this.round(parseInt(0.05 * this.product.price + this.index()));
    } else {
      return this.round(parseInt(this.index()));
    }
  }
}

module.exports = Deduct;
