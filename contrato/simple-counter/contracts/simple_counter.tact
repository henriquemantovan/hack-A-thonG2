import "@stdlib/deploy";

struct Item {
    price: int as uint32;
    quantity: int as uint32;
    owner: address;
}

message AddItem
{
    item: Item;
}

message GetPrice {
    queryId: Int as uint64;
    name: String;
}

contract TactStore with Deployable {
    storeId: Int as uint32;
    items: map<Int id as uint32, Item>;
    idItter: Int as uint32;

    init(storeId: Int) {
        self.storeId = storeId;
        self.items = map();
        self.idItter = 0;
    }

    receive AddItem(msg: AddItem){
        self.items.set(self.idItter, msg.item);
        self.idItter += 1;
    }

}
