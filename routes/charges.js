class Deduct {
  constructor(product) {
    this.product = product;
  }
  urgency() {
    if (this.product.urgent == true) {
      return this.product.price * 0.02;
    } else {
      return this.product.price * 0.01;
    }
  }
  qty() {
    if (this.product.qty == true) {
      return this.product.price * 0.03;
    } else {
      return this.product.price * 0.01;
    }
  }
  size() {
    if (this.product.size == true) {
      return this.product.price * 0.02;
    } else {
      return this.product.price * 0.01;
    }
  }
  weight() {
    if (this.product.weight == true) {
      return this.product.price * 0.02;
    } else {
      return this.product.price * 0.01;
    }
  }
  fragile() {
    if (this.product.fragile == true) {
      return this.product.price * 0.02;
    } else {
      return this.product.price * 0.01;
    }
  }
  location() {
    if (this.product.location == "Kampala") {
      return this.product.price * 0.05;
    } else if (this.product.location == "Lira") {
      return this.product.price * 0.03;
    } else {
      return this.product.price * 0.02;
    }
  }
  userLocation() {
    let delivery = 0;
    switch (this.product.user) {
      case "Keturah":
        delivery = this.product.price * 0.002;
        break;
      case "Royal":
        delivery = this.product.price * 0.002;
        break;
      case "Maisha":
        delivery = this.product.price * 0.0001;
        break;
      case "Pioneer":
        delivery = this.product.price * 0.001;
        break;
      case "Washington":
        delivery = this.product.price * 0.0015;
        break;
      case "St. Peters":
        delivery = this.product.price * 0.002;
        break;
      case "Pacuwa":
        delivery = this.product.price * 0.0025;
        break;
      case "Northern Elite":
        delivery = this.product.price * 0.001;
        break;
      case "Jeremiah":
        delivery = this.product.price * 0.0015;
        break;
      case "Hospital":
        delivery = this.product.price * 0.002;
        break;
      case "Management Sciences":
        delivery = this.product.price * 0.0015;
        break;
      case "Education Block":
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
      this.userLocation() +
      this.weight()
    );
  }
  index() {
    let index;
    if (this.product.price >= 5000 && this.product.price <= 20000) {
      index = this.factorPrice * 0.8;
    } else if (this.product.price >= 20001 && this.product.price <= 100000) {
      index = this.factorPrice * 0.7;
    } else if (this.product.price >= 100001 && this.product.price <= 250000) {
      index = this.factorPrice * 0.6;
    } else if (this.product.price >= 250001 && this.product.price <= 600000) {
      index = this.factorPrice * 0.5;
    } else if (this.product.price >= 600001 && this.product.price <= 1000000) {
      index = this.factorPrice * 0.4;
    } else if (this.product.price >= 1000001 && this.product.price <= 1500000) {
      index = this.factorPrice * 0.3;
    } else if (this.product.price > 1500000) {
      index = this.factorPrice * 0.2;
    } else {
      index = this.factorPrice * 1;
    }
    return index;
  }
  round(i) {
    if (i % 10 != 0 || (i / 10) % 10 != 0) {
      return parseInt(i / 100) * 100 + 100;
    } else {
      return i;
    }
  }
  get price() {
    return this.round(this.product.price);
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
