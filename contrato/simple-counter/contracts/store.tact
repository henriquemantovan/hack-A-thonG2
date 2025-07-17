contract Store {
  owner: Address;
  products: map<Int, Product>;

  init(owner: Address) {
    this.owner = owner;
    this.products = map();
  }

  public fn add_product(id: Int, price: Int, amount: Int) {
    require(msg.sender == this.owner, "Only owner");
    this.products.set(id, Product(price, amount));
  }

  public fn change_price(id: Int, new_price: Int) {
    require(msg.sender == this.owner, "Only owner");
    let product = this.products.get(id).expect("Not found");
    this.products.set(id, Product(new_price, product.amount));
  }

  public fn change_amount(id: Int, new_amount: Int) {
    require(msg.sender == this.owner, "Only owner");
    let product = this.products.get(id).expect("Not found");
    this.products.set(id, Product(product.price, new_amount));
  }

  public fn remove_product(id: Int) {
    require(msg.sender == this.owner, "Only owner");
    this.products.delete(id);
  }


  get fn get_product(id: Int): Product? {
    return this.products.get(id);
  }
}
