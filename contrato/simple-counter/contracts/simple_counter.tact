import "@stdlib/deploy";
//https://docs.tact-lang.org/book/compile/
//https://docs.tact-lang.org/ref/evolution/otp-002/
//https://docs.ton.org/v3/guidelines/ton-connect/frameworks/react

struct Item {
    price: Int as uint32;
    quantity: Int as uint32;
    owner: Address;
}

message AddItem
{
    price: Int as uint32;
    quantity: Int as uint32;
}

message RMItem {

    id: Int as uint32;
}

message BuyItem{
    id: Int as uint32;
}

contract TactStore with Deployable {
    storeId: Int as uint32;
    items: map<Int as uint32, Item>;
    idItter: Int as uint32;

    init(storeId: Int) {
        self.storeId = storeId;
        self.items = emptyMap();
        self.idItter = 0;
    }

    receive (msg: AddItem){
        let estrutura: Item = Item{
            price: msg.price,
            quantity: msg.quantity,
            owner : sender()
        };
        self.items.set(self.idItter, estrutura);
        self.idItter += 1;
    }

    receive(msg: RMItem) {
        let itemOpt = self.items.get(msg.id);
        require(itemOpt != null, "The item doesn't exist");
        let item = itemOpt!!;
        require(item.owner == sender(), "You are not the owner of this Item");
        self.items.del(msg.id);
    }

    receive(msg: BuyItem) {
        let itemOpt = self.items.get(msg.id);
        require(itemOpt != null, "The item doesn't exist");
        
        let item = itemOpt!!;
        require(item.quantity > 0, "Item is out of stock");

        let ctx: Context = context();
        //UNIDADE: TON
        require(ctx.value/1000000000 >= item.price, "Insufficient TON sent");

        send(SendParameters {
        to: item.owner,
        value: ctx.value
        });

        let newQuantity = item.quantity - 1;
        if (newQuantity > 0) {
            let updatedItem: Item = Item{
                price: item.price,
                quantity: newQuantity,
                owner: item.owner
            };
            self.items.set(msg.id, updatedItem);
        } else {
            self.items.del(msg.id);
        }
    }
    
    get fun get_store_id(): Int {
    return self.storeId;
    }

    get fun get_item(id: Int): Item? {
        return self.items.get(id);
    }

    get fun get_item_count(): Int {
        return self.idItter;
    }



}
