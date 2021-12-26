
class Session
{
    constructor(engine)
    {
        this.engine = engine;

        this.users = new Set();

        this.pulseQueue = [];

        this.pulseTimer = setInterval( ()=>this.pulse(), 100 );

        
    }

    /**
     * Lets the given user join this session.
     * @param {User} user 
     */
    join(user)
    {
        // Add the given user to the session.
        this.users.add(user);

        user.join(this);
    }

    /**
     * 
     * @param {*} user 
     */
    leave(user)
    {
        this.users.delete(user);
        
        user.leave(this);
    }


    updateClients()
    {
    
        const updates = JSON.stringify(serializeMap());
    
        // Traverse all clients and update them.
        for (let webSocket of clients)
            webSocket.send(updates);
    }


    serialize()
    {
        // Traverse the users and serialize their state.
        const users = [];
        for (let user of this.users) users.push(user.serialize());

        const data = {
            type: 'session',
            users
        };
    
        return data;
    }


    queue(updates)
    {
        const data = (updates ? {'type': 'update', updates: (Array.isArray(updates) ? updates : [updates]) } : this.serialize());

        // push the data onto the queue.
        this.pulseQueue.push( data );

        console.log(data);
    }



    pulse()
    {
        if (this.pulseQueue.length === 0) return;

        // If there is something in the queue then dequeue it and send it to all the users.
        const json = JSON.stringify(this.pulseQueue);

        this.pulseQueue.splice(0, this.pulseQueue.length);

        // Send the data to the user session users.
        for (let user of this.users) user.send(json);
    }

}

module.exports = Session;