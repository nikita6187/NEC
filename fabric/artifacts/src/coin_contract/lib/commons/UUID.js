class UUID {
    constructor(keyIdentifier, startID = 0) {
        this.keyIdentifier = keyIdentifier;
        this.startID = startID;

        //this.mutex = new Mutex();
    }

    async init(ctx) {
        //Initialize global state
        await ctx.stub.putState(this.keyIdentifier, 
            Buffer.from(JSON.stringify({
                id: this.startID})
            )
        );
    }

    async next(ctx) {        
        // Get current counter
        const counterAsBytes = await ctx.stub.getState(this.keyIdentifier);
        let counter = JSON.parse(counterAsBytes.toString());

        // Update counter
        counter.id = counter.id + 1;
        await ctx.stub.putState(this.keyIdentifier, 
            Buffer.from(JSON.stringify(counter)));

        return counter.id;
    }
}

module.exports = UUID;