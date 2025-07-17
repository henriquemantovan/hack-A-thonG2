struct Product {
  price: Int;
  amount: Int;
  seller: Address;
}
//NO CASO O ID EH O LUGAR DA LISTA
contract Store {
  owner: Address;
  products: map<Int, Product>;

  init(owner: Address) {
    this.owner = owner;
    this.products = map();
  }

  public fn add_product(id: Int, price: Int, amount: Int) {
    this.products.set(id, Product(price, amount, msg.sender));
  }

  public fn change_price(id: Int, new_price: Int) {
    let product = this.products.get(id).expect("Not found");
    require(msg.sender == product.seller, "Only seller");
    this.products.set(id, Product(new_price, product.amount, product.seller));
  }

  public fn change_amount(id: Int, new_amount: Int) {
    let product = this.products.get(id).expect("Not found");
    require(msg.sender == product.seller, "Only seller");
    this.products.set(id, Product(product.price, new_amount, product.seller));
  }

  public fn remove_product(id: Int) {
    let product = this.products.get(id).expect("Not found");
    require(msg.sender == product.seller, "Only seller");
    this.products.delete(id);
  }

  get fn get_product(id: Int): Product? {
    return this.products.get(id);
  }
}
